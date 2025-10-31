from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_training_db
from models import User, Conversation
from schemas import ChatRequest, ChatResponse, ConversationResponse
from auth import get_current_user
from services.llm_service import llm_service
from services.vector_store_service import vector_store_service
from typing import List

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """
    Send a message to the AI assistant with RAG support
    Chat history is automatically stored in FAISS vector database
    """
    try:
        # Generate response using LLM with RAG (retrieves relevant past conversations)
        result = await llm_service.generate_response_with_history(
            question=chat_request.message,
            user_email=current_user.email,
            context=chat_request.context
        )
        
        response = result["response"]
        
        # Save conversation to SQL database
        conversation = Conversation(
            user_email=current_user.email,
            question=chat_request.message,
            response=response,
            context=chat_request.context
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        # Update vector store with conversation ID
        # (This links the vector store entry to the database record)
        
        return ChatResponse(
            response=response, 
            timestamp=datetime.utcnow(),
            used_rag=result.get("used_rag", False)
        )
    
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
    #Delete a specific conversation
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


@router.get("/similar")
async def search_similar_conversations(
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """
    Search for similar past conversations using semantic search (RAG)
    """
    try:
        results = vector_store_service.search_similar_conversations(
            query=query,
            user_email=current_user.email,
            k=limit
        )
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error searching conversations: {str(e)}"
        )


@router.get("/context")
async def get_rag_context(
    query: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get relevant context from past conversations for a query (RAG)
    """
    try:
        context = vector_store_service.get_relevant_context(
            query=query,
            user_email=current_user.email,
            max_results=3
        )
        return {
            "query": query,
            "context": context
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving context: {str(e)}"
        )


@router.get("/vector-stats")
async def get_vector_store_stats(
    current_user: User = Depends(get_current_user)
):
    """
    Get statistics about the vector store
    """
    try:
        stats = vector_store_service.get_stats()
        
        # Add user-specific stats
        user_convos = [
            meta for meta in vector_store_service.metadata
            if meta["user_email"] == current_user.email
        ]
        
        return {
            "global_stats": stats,
            "user_conversations": len(user_convos),
            "user_email": current_user.email
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting stats: {str(e)}"
        )


@router.delete("/vector-store/clear")
async def clear_user_vector_store(
    current_user: User = Depends(get_current_user)
):
    """
    Clear all vector store entries for the current user
    """
    try:
        deleted_count = vector_store_service.delete_user_conversations(
            user_email=current_user.email
        )
        return {
            "message": f"Cleared {deleted_count} conversations from vector store",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing vector store: {str(e)}"
        )
