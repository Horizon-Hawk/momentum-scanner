import asyncio
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import httpx
import databento as db

from .models import FilterConfig, StockSnapshot
from .filters import passes_filters
from ..db.supabase import SupabaseWriter

logger = logging.getLogger(__name__)

EASTERN = ZoneInfo("America/New_York")
MARKET_OPEN_SECONDS = 6.5 * 3600   # 9:30 AM to 4:00 PM
FIXED_POINT = 1_000_000_000         # Databento int64 prices ÷ 1e9 = dollars
FMP_BASE = "https://financialmodelingprep.com/api"


class ScannerEngine:
    def __init__(
        self,
        db_api_key: str,
        fmp_api_key: str,
        writer: SupabaseWriter,
        config: FilterConfig,
    ) -> None:
        self._db_key = db_api_key
        self._fmp_key = fmp_api_key
        self.writer = writer
        self.config = config

        self._id_to_ticker: dict[int, str] = {}
        self._cache: dict[str, dict] = {}   # ticker → {prev_close, adv, float_shares, company}
        self._daily_vol: dict[str, int] = {}
        self._hod: dict[str, float] = {}
        self._lod: dict[str, float] = {}
        self._in_results: set[str] = set()

    async def bootstrap(self) -> None:
        """
        Fetch prev_close + ADV from FMP quotes (2 calls) and
        float from FMP shares_float (1 call). Total: 3 API calls.
        """
        logger.info("Bootstrap: loading ticker universe from FMP…")
        async with httpx.AsyncClient(timeout=60) as client:
            for exchange in ("nyse", "nasdaq"):
                try:
                    resp = await client.get(
                        f"{FMP_BASE}/v3/quotes/{exchange}",
                        params={"apikey": self._fmp_key},
                    )
                    resp.raise_for_status()
                    for item in resp.json():
                        ticker = item.get("symbol", "")
                        if not ticker or "." in ticker or len(ticker) > 5:
                            continue
                        self._cache[ticker] = {
                            "prev_close": float(item.get("previousClose") or 0),
                            "adv": int(item.get("avgVolume") or 0),
                            "company": item.get("name", ""),
                            "float_shares": 0,
                        }
                except Exception as exc:
                    logger.error("FMP quotes/%s failed: %s", exchange, exc)

            try:
                resp = await client.get(
                    f"{FMP_BASE}/v4/shares_float",
                    params={"apikey": self._fmp_key},
                )
                resp.raise_for_status()
                for item in resp.json():
                    ticker = item.get("symbol", "")
                    if ticker and ticker in self._cache:
                        self._cache[ticker]["float_shares"] = int(
                            float(item.get("floatShares") or 0)
                        )
            except Exception as exc:
                logger.error("FMP shares_float failed: %s", exc)

        # Clear stale results from a previous session
        self.writer.clear_all()
        logger.info("Bootstrap complete: %d tickers loaded", len(self._cache))

    async def run(self, queue: asyncio.Queue) -> None:
        while True:
            record = await queue.get()
            try:
                cls_name = type(record).__name__
                if cls_name == "SymbolMappingMsg":
                    self._id_to_ticker[record.instrument_id] = record.stype_out_symbol
                elif cls_name == "OHLCVMsg":
                    await self._on_ohlcv(record)
            except Exception as exc:
                logger.error("Engine record error: %s", exc)

    async def _on_ohlcv(self, msg) -> None:
        ticker = self._id_to_ticker.get(msg.instrument_id)
        if not ticker:
            return

        price      = msg.close / FIXED_POINT
        open_price = msg.open  / FIXED_POINT
        high       = msg.high  / FIXED_POINT
        low        = msg.low   / FIXED_POINT
        vol        = int(msg.volume)

        # Accumulate intra-day volume and track HOD/LOD
        self._daily_vol[ticker] = self._daily_vol.get(ticker, 0) + vol
        self._hod[ticker] = max(self._hod.get(ticker, high), high)
        self._lod[ticker] = min(self._lod.get(ticker, low), low)

        cache = self._cache.get(ticker)
        if not cache:
            return

        prev_close = cache.get("prev_close", 0)
        adv        = cache.get("adv", 0)
        gap_pct    = ((open_price - prev_close) / prev_close * 100) if prev_close else 0

        now_et   = datetime.now(EASTERN)
        open_et  = now_et.replace(hour=9, minute=30, second=0, microsecond=0)
        elapsed  = max(60.0, (now_et - open_et).total_seconds())
        fraction = min(1.0, elapsed / MARKET_OPEN_SECONDS)
        accum    = self._daily_vol[ticker]
        rvol     = (accum / (adv * fraction)) if (adv and fraction) else 0.0

        stock = StockSnapshot(
            ticker=ticker,
            company_name=cache.get("company", ""),
            price=round(price, 4),
            prev_close=round(prev_close, 4),
            gap_pct=round(gap_pct, 2),
            volume=accum,
            avg_volume=adv,
            rvol=round(rvol, 2),
            float_shares=cache.get("float_shares", 0),
            high_of_day=round(self._hod[ticker], 4),
            low_of_day=round(self._lod[ticker], 4),
            open_price=round(open_price, 4),
            sector=cache.get("sector", ""),
        )

        if passes_filters(stock, self.config):
            self._in_results.add(ticker)
            row = stock.model_dump()
            row["last_updated"] = datetime.now().isoformat()
            self.writer.upsert_result(row)
        elif ticker in self._in_results:
            self._in_results.discard(ticker)
            self.writer.remove_result(ticker)
