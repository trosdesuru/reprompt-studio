# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Base de datos y Core
    DATABASE_URL: str
    SECRET_KEY: str
    REDIS_URL: str

    # Cloudflare R2
    R2_ENDPOINT_URL: str
    R2_ACCESS_KEY: str
    R2_SECRET_KEY: str
    R2_BUCKET_NAME: str
    R2_PUBLIC_URL: str

    # Google Auth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    INVITE_ONLY_MODE: bool = True

    # Discord Auth
    DISCORD_CLIENT_ID: str = ""
    DISCORD_CLIENT_SECRET: str = ""
    INVITE_ONLY_MODE: bool = True


model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
