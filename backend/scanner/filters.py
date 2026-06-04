from .models import StockSnapshot, FilterConfig

ROSS_CAMERON_DEFAULTS = FilterConfig(
    min_price=1.0,
    max_price=20.0,
    max_float_millions=20.0,
    min_gap_pct=10.0,
    min_rvol=5.0,
)


def passes_filters(stock: StockSnapshot, config: FilterConfig) -> bool:
    if not (config.min_price <= stock.price <= config.max_price):
        return False
    if stock.float_shares and stock.float_shares / 1_000_000 > config.max_float_millions:
        return False
    if stock.gap_pct < config.min_gap_pct:
        return False
    if stock.rvol < config.min_rvol:
        return False
    return True
