import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

env_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")


class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["*"]

    # Vision Provider Settings
    VISION_PROVIDER: str = "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Search Provider Settings
    SEARCH_PROVIDER: str = "mock"
    BRAVE_API_KEY: str = ""
    SERPAPI_API_KEY: str = ""

    # Strategy & Rate Limits
    SEARCH_MODE: str = "marketplace"
    MAX_QUERIES: int = 4
    MAX_RESULTS_PER_QUERY: int = 5
    MAX_MARKETPLACES: int = 3

    model_config = SettingsConfigDict(
        env_file=env_file_path if os.path.exists(env_file_path) else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
