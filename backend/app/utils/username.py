import unicodedata
import re


def normalize_username(username: str, max_chars: int = 30) -> str:
    if not username:
        return ""

    nfkd_form = unicodedata.normalize("NFKD", username)
    text = "".join([c for c in nfkd_form if not unicodedata.combining(c)])

    text = text.lower().strip()

    text = re.sub(r"[^a-z0-9]+", "_", text)

    text = text.strip("_")

    return text[:max_chars]
