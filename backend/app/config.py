import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    data_root: str
    model_path: str
    normalization_path: str
    host: str = "127.0.0.1"
    port: int = 8000
    device: str = "cpu"   # "cpu" or "mps" — default ALWAYS cpu for stability

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
