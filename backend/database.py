from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# User Database
user_engine = create_engine(settings.USER_DATABASE_URL)
UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
UserBase = declarative_base()

# Training Database Engine
training_engine = create_engine(settings.TRAINING_DATABASE_URL)
TrainingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=training_engine)
TrainingBase = declarative_base()


def get_user_db():
    
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_training_db():
    
    db = TrainingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    
    UserBase.metadata.create_all(bind=user_engine)
    TrainingBase.metadata.create_all(bind=training_engine)
