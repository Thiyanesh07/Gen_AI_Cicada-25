from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from database import UserBase, TrainingBase


class User(UserBase):
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(TrainingBase):
    
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)  # Store email
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
