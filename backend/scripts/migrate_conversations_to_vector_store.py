"""
Migration script to load existing conversations into FAISS vector store
Run this once to populate the vector database with existing chat history
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Conversation
from services.vector_store_service import vector_store_service
from config import settings


def migrate_conversations():
    """
    Migrate all existing conversations from SQL database to FAISS vector store
    """
    print("🚀 Starting conversation migration to vector store...")
    
    # Create database connection
    engine = create_engine(settings.TRAINING_DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get all conversations
        conversations = db.query(Conversation).all()
        
        if not conversations:
            print("ℹ️ No conversations found in database")
            return
        
        print(f"📊 Found {len(conversations)} conversations to migrate")
        
        # Add each conversation to vector store
        success_count = 0
        error_count = 0
        
        for convo in conversations:
            try:
                vector_store_service.add_conversation(
                    user_email=convo.user_email,
                    question=convo.question,
                    response=convo.response,
                    conversation_id=convo.id
                )
                success_count += 1
                
                if success_count % 10 == 0:
                    print(f"✅ Migrated {success_count}/{len(conversations)} conversations...")
            
            except Exception as e:
                print(f"❌ Error migrating conversation {convo.id}: {str(e)}")
                error_count += 1
        
        print(f"\n🎉 Migration complete!")
        print(f"   ✅ Successfully migrated: {success_count}")
        print(f"   ❌ Errors: {error_count}")
        print(f"   📊 Total vectors in store: {vector_store_service.index.ntotal}")
        
        # Show stats
        stats = vector_store_service.get_stats()
        print(f"\n📈 Vector Store Stats:")
        print(f"   Total conversations: {stats['total_conversations']}")
        print(f"   Total users: {stats['total_users']}")
        print(f"   Embedding model: {stats['embedding_model']}")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    migrate_conversations()
