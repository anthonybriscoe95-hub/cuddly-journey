from .config import PRICING


def calculate_quote(
    num_windows: int, stories: int = 1, screens: bool = False, tracks: bool = False
) -> float:
    if num_windows <= 0:
        raise ValueError("num_windows must be positive")

    total = PRICING["base_fee"] + num_windows * PRICING["price_per_window"]

    if stories and stories >= 2:
        total += num_windows * PRICING["story_surcharge_per_window"]
    if screens:
        total += num_windows * PRICING["screens_price_per_window"]
    if tracks:
        total += num_windows * PRICING["tracks_price_per_window"]

    return round(total, 2)
