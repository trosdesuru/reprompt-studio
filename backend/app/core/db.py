import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

raw_url = os.getenv("DATABASE_URL")

if not raw_url:
    raise ValueError(
        "🚨 CRÍTICO: No se encontró DATABASE_URL en las variables de entorno."
    )

if raw_url.startswith("postgres://"):
    clean_url = raw_url.replace("postgres://", "postgresql://", 1)
else:
    clean_url = raw_url

clean_url = clean_url.replace("-pooler", "")

if "?" in clean_url:
    clean_url = clean_url.split("?")[0]

engine = create_engine(
    clean_url,
    connect_args={
        "sslmode": "require"
    },
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)


def get_session():
    with Session(engine) as session:
        yield session
