from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, Date
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


class CropLog(TrainingBase):
    
    __tablename__ = "crop_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)  # Owner of the crop
    crop_name = Column(String, nullable=False)  # e.g., "Paddy", "Tomato", "Cotton"
    location = Column(String, nullable=False)  # City/region for weather data
    latitude = Column(Float, nullable=True)  # For precise weather
    longitude = Column(Float, nullable=True)  # For precise weather
    date_planted = Column(Date, nullable=False)
    growth_stage = Column(String, nullable=False)  # "seedling", "vegetative", "flowering", "harvest"
    notes = Column(Text, nullable=True)  # Additional farmer notes
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Notification(TrainingBase):
    
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, nullable=False, index=True)  # References 
    user_email = Column(String, index=True, nullable=False)  # Notification owner
    crop_name = Column(String, nullable=False)  
    message = Column(Text, nullable=False)  # suggestion
    notification_type = Column(String, nullable=False)  #warning
    weather_condition = Column(String, nullable=True)  
    temperature = Column(Float, nullable=True)  
    humidity = Column(Float, nullable=True)  
    is_read = Column(Boolean, default=False)  
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
