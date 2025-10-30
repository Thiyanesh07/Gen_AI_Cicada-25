from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # User Database
    USER_DATABASE_URL: str
    
    # Training Database
    TRAINING_DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    
    # CORS
    CORS_ORIGINS: str = '["http://localhost:3000", "http://localhost:3001"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
