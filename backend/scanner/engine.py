import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from zoneinfo import ZoneInfo

import yfinance as yf

from .models import FilterConfig, StockSnapshot
from .filters import passes_filters
from ..db.supabase import SupabaseWriter

logger = logging.getLogger(__name__)

EASTERN = ZoneInfo("America/New_York")
MARKET_OPEN_SECONDS = 6.5 * 3600
FIXED_POINT = 1_000_000_000


def _fetch_ticker_meta(ticker: str) -> dict:
    try:
        info = yf.Ticker(ticker).fast_info
        return {
            "prev_close": float(getattr(info, "previous_close", 0) or 0),
            "adv": int(getattr(info, "three_month_average_volume", 0) or 0),
            "float_shares": int(getattr(info, "shares_outstanding", 0) or 0),
            "company": ticker,
        }
    except Exception as exc:
        logger.debug("yfinance meta failed for %s: %s", ticker, exc)
        return {"prev_close": 0, "adv": 0, "float_shares": 0, "company": ticker}


class ScannerEngine:
    def __init__(
        self,
        db_api_key: str,
        writer: SupabaseWriter,
        config: FilterConfig,
    ) -> None:
        self._db_key = db_api_key
        self.writer = writer
        self.config = config

        self._id_to_ticker: dict[int, str] = {}
        self._cache: dict[str, dict] = {}
        self._daily_vol: dict[str, int] = {}
        self._hod: dict[str, float] = {}
        self._lod: dict[str, float] = {}
        self._in_results: set[str] = set()
        self._pending_meta: set[str] = set()
        self._executor = ThreadPoolExecutor(max_workers=8, thread_name_prefix="yf")

    async def bootstrap(self) -> None:
        self.writer.clear_all()
        logger.info("Bootstrap complete — meta fetched lazily per ticker")

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

    async def _ensure_meta(self, ticker: str) -> None:
        if ticker in self._cache or ticker in self._pending_meta:
            return
        self._pending_meta.add(ticker)
        loop = asyncio.get_running_loop()
        meta = await loop.run_in_executor(self._executor, _fetch_ticker_meta, ticker)
        self._cache[ticker] = meta
        self._pending_meta.discard(ticker)

    async def _on_ohlcv(self, msg) -> None:
        ticker = self._id_to_ticker.get(msg.instrument_id)
        if not ticker:
            return

        await self._ensure_meta(ticker)

        price      = msg.close / FIXED_POINT
        open_price = msg.open  / FIXED_POINT
        high       = msg.high  / FIXED_POINT
        low        = msg.low   / FIXED_POINT
        vol        = int(msg.volume)

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
            company_name=cache.get("company", ticker),
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
