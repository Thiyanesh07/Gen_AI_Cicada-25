from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_training_db
from models import User, Conversation
from schemas import ChatRequest, ChatResponse, ConversationResponse
from auth import get_current_user
from services.llm_service import llm_service
from typing import List

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Send a chat message and get AI response"""
    try:
        # Generate response using local LLM
        response = await llm_service.generate_response(
            question=chat_request.message,
            context=chat_request.context
        )
        
        # Save conversation to database
        conversation = Conversation(
            user_email=current_user.email,
            question=chat_request.message,
            response=response,
            context=chat_request.context
        )
        db.add(conversation)
        db.commit()
        
        return ChatResponse(response=response, timestamp=datetime.utcnow())
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat message: {str(e)}"
        )


@router.get("/history", response_model=List[ConversationResponse])
async def get_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    
    conversations = db.query(Conversation)\
        .filter(Conversation.user_email == current_user.email)\
        .order_by(Conversation.timestamp.desc())\
        .limit(limit)\
        .all()
    
    return conversations


@router.delete("/history/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Delete a specific conversation"""
    conversation = db.query(Conversation)\
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_email == current_user.email
        ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}
