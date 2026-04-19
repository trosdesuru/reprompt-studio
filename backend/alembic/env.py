import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# 1. Cargar tus variables de entorno para conectar con Neon
load_dotenv()

# 2. Importar SQLModel y ABSOLUTAMENTE TODOS tus modelos
from sqlmodel import SQLModel
from app.models.user import User, InviteCode, AuditLog
from app.models.directory import Directory
from app.models.gallery import GalleryMetric
from app.models.prompt import ImagePrompt

# this is the Alembic Config object
config = context.config

# 3. Sobrescribir la URL de la base de datos dinámica (Neon)
raw_url = os.getenv("DATABASE_URL", "")
clean_url = (
    raw_url.strip().strip("'").strip('"').replace("postgres://", "postgresql://", 1)
)

# Asegurar sslmode para Neon
if "sqlite" not in clean_url and "sslmode=require" not in clean_url:
    separator = "&" if "?" in clean_url else "?"
    clean_url += f"{separator}sslmode=require"

config.set_main_option("sqlalchemy.url", clean_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. Indicar a Alembic dónde está el esquema de metadatos
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
