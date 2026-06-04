from pydantic import BaseModel
from dataclasses import dataclass, field


class StockSnapshot(BaseModel):
    ticker: str
    company_name: str = ""
    price: float = 0.0
    prev_close: float = 0.0
    gap_pct: float = 0.0
    volume: int = 0
    avg_volume: int = 0
    rvol: float = 0.0
    float_shares: int = 0
    high_of_day: float = 0.0
    low_of_day: float = 0.0
    open_price: float = 0.0
    sector: str = ""


@dataclass
class FilterConfig:
    min_price: float = 1.0
    max_price: float = 20.0
    max_float_millions: float = 20.0
    min_gap_pct: float = 10.0
    min_rvol: float = 5.0
