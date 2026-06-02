from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "eCommerce API"

    JWT_SECRET: str
    DATABASE_URL: str

    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    UPLOAD_DIR: str = "static/uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()