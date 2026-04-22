import pytest
from app.utils.username import normalize_username


def test_normalize_username_basic():
    assert normalize_username("Eduard Hernández") == "eduard_hernandez"


def test_normalize_username_length():
    long_name = "a" * 100
    assert len(normalize_username(long_name)) == 30
