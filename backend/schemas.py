from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional


# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Conversation Schemas
class ConversationCreate(BaseModel):
    question: str
    response: str
    context: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    user_email: str
    question: str
    response: str
    context: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True


# Chat Schemas
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    used_rag: Optional[bool] = False  # Flag to indicate if RAG was used


# Crop Log Schemas
class CropLogCreate(BaseModel):
    crop_name: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date_planted: date
    growth_stage: str  # "seedling", "vegetative", "flowering", "harvest"
    notes: Optional[str] = None


class CropLogUpdate(BaseModel):
    crop_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    growth_stage: Optional[str] = None
    notes: Optional[str] = None


class CropLogResponse(BaseModel):
    id: int
    user_email: str
    crop_name: str
    location: str
    latitude: Optional[float]
    longitude: Optional[float]
    date_planted: date
    growth_stage: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    crop_id: int
    user_email: str
    crop_name: str
    message: str
    notification_type: str  # "info", "warning", "alert"
    weather_condition: Optional[str]
    temperature: Optional[float]
    humidity: Optional[float]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    is_read: bool


# Weather Data Schema (for internal use)
class WeatherData(BaseModel):
    temperature: float
    humidity: float
    condition: str  # "Rain", "Clear", "Clouds", etc.
    description: str
    wind_speed: float
