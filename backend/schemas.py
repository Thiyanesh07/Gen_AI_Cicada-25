from pydantic import BaseModel, EmailStr
from datetime import datetime
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
