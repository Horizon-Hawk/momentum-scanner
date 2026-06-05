import asyncio
import logging
import threading
import databento as db

logger = logging.getLogger(__name__)

DATASET = "EQUS.MINI"


class DatabentoFeed:
    """
    Wraps Databento's blocking Live client in a daemon thread and
    funnels every record into an asyncio.Queue for the engine to consume.
    """

    def __init__(self, api_key: str, queue: asyncio.Queue, loop: asyncio.AbstractEventLoop):
        self._api_key = api_key
        self._queue = queue
        self._loop = loop

    def start(self) -> None:
        t = threading.Thread(target=self._run, daemon=True, name="databento-feed")
        t.start()
        logger.info("Databento feed thread started (dataset=%s)", DATASET)

    def _run(self) -> None:
        while True:
            try:
                live = db.Live(key=self._api_key)
                live.subscribe(
                    dataset=DATASET,
                    schema="ohlcv-1m",
                    stype_in="raw_symbol",
                    symbols="ALL_SYMBOLS",
                )
                live.start()
                logger.info("Databento WebSocket connected")
                for record in live:
                    asyncio.run_coroutine_threadsafe(
                        self._queue.put(record), self._loop
                    )
            except Exception as exc:
                logger.error("Databento feed error: %s — reconnecting in 10s", exc)
                import time
                time.sleep(10)
