import pytest

from window_agent.quoting import calculate_quote


def test_base_quote():
    assert calculate_quote(10, stories=1) == 50.0 + 10 * 6.0


def test_second_story_surcharge():
    one_story = calculate_quote(10, stories=1)
    two_story = calculate_quote(10, stories=2)
    assert two_story == one_story + 10 * 2.0


def test_screens_and_tracks_add_cost():
    base = calculate_quote(10, stories=1)
    with_extras = calculate_quote(10, stories=1, screens=True, tracks=True)
    assert with_extras == base + 10 * 2.0 + 10 * 1.5


def test_rejects_non_positive_windows():
    with pytest.raises(ValueError):
        calculate_quote(0)
