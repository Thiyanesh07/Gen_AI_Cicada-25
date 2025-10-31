from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_training_db
from models import User, Conversation
from schemas import ConversationResponse
from auth import get_current_user
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("/all", response_model=List[ConversationResponse])
async def get_all_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    
    conversations = db.query(Conversation)\
        .filter(Conversation.user_email == current_user.email)\
        .order_by(Conversation.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return conversations


@router.get("/export")
async def export_conversations_for_training(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    conversations = db.query(Conversation)\
        .filter(
            Conversation.user_email == current_user.email,
            Conversation.timestamp >= cutoff_date
        )\
        .order_by(Conversation.timestamp.asc())\
        .all()
    
    # Format for training (JSON)
    training_data = [
        {
            "instruction": conv.question,
            "response": conv.response,
            "context": conv.context or "",
            "timestamp": conv.timestamp.isoformat()
        }
        for conv in conversations
    ]
    
    return {
        "total_conversations": len(training_data),
        "date_range": {
            "from": cutoff_date.isoformat(),
            "to": datetime.utcnow().isoformat()
        },
        "data": training_data
    }


@router.get("/statistics")
async def get_conversation_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    
    total_conversations = db.query(func.count(Conversation.id))\
        .filter(Conversation.user_email == current_user.email)\
        .scalar()
    
    conversations_last_7_days = db.query(func.count(Conversation.id))\
        .filter(
            Conversation.user_email == current_user.email,
            Conversation.timestamp >= datetime.utcnow() - timedelta(days=7)
        )\
        .scalar()
    
    conversations_last_30_days = db.query(func.count(Conversation.id))\
        .filter(
            Conversation.user_email == current_user.email,
            Conversation.timestamp >= datetime.utcnow() - timedelta(days=30)
        )\
        .scalar()
    
    return {
        "total_conversations": total_conversations,
        "last_7_days": conversations_last_7_days,
        "last_30_days": conversations_last_30_days
    }
