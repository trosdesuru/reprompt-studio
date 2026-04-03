import os
from sqlmodel import create_engine, Session
from sqlalchemy.pool import NullPool
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

conn_args = {}
if "sslmode" not in clean_url:
    conn_args["sslmode"] = "require"

engine = create_engine(
    clean_url,
    connect_args=conn_args,
    echo=False,
    poolclass=NullPool,
)

def get_session():
    with Session(engine) as session:
        yield session