import requests

# Sesión global persistente para máxima velocidad
http_session = requests.Session()
http_session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Cookie": "nw=1",
    }
)