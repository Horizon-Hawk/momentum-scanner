import asyncio
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)

from db.supabase import SupabaseWriter
from feeds.databento_feed import DatabentoFeed
from scanner.engine import ScannerEngine
from scanner.filters import ROSS_CAMERON_DEFAULTS


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue(maxsize=10_000)

    writer  = SupabaseWriter()
    engine  = ScannerEngine(
        db_api_key=os.environ["DATABENTO_API_KEY"],
        fmp_api_key=os.environ["FMP_API_KEY"],
        writer=writer,
        config=ROSS_CAMERON_DEFAULTS,
    )
    feed = DatabentoFeed(
        api_key=os.environ["DATABENTO_API_KEY"],
        queue=queue,
        loop=loop,
    )

    await engine.bootstrap()
    feed.start()
    task = asyncio.create_task(engine.run(queue))

    yield

    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Momentum Scanner API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}
