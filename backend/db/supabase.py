import logging
import os
from supabase import create_client, Client

logger = logging.getLogger(__name__)


class SupabaseWriter:
    def __init__(self) -> None:
        self._client: Client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )

    def upsert_result(self, row: dict) -> None:
        try:
            self._client.table("scanner_results").upsert(row).execute()
        except Exception as exc:
            logger.error("Supabase upsert failed for %s: %s", row.get("ticker"), exc)

    def remove_result(self, ticker: str) -> None:
        try:
            self._client.table("scanner_results").delete().eq("ticker", ticker).execute()
        except Exception as exc:
            logger.error("Supabase delete failed for %s: %s", ticker, exc)

    def clear_all(self) -> None:
        try:
            self._client.table("scanner_results").delete().neq("ticker", "").execute()
        except Exception as exc:
            logger.error("Supabase clear failed: %s", exc)
