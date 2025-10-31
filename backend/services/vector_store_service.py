"""
Vector Store Service with FAISS for RAG (Retrieval-Augmented Generation)
Stores chat history in vector database for semantic search
"""

import faiss
import numpy as np
import pickle
import os
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter


class VectorStoreService:
    """
    FAISS-based vector store for chat history and context retrieval
    """
    
    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2", vector_dim: int = 384):
        """
        Initialize the vector store service
        
        Args:
            embedding_model: Name of the sentence-transformers model
            vector_dim: Dimension of the embeddings (384 for MiniLM-L6)
        """
        self.embedding_model_name = embedding_model
        self.vector_dim = vector_dim
        
        # Initialize embedding model
        print(f"Loading embedding model: {embedding_model}")
        self.embedding_model = SentenceTransformer(embedding_model)
        
        # Initialize FAISS index
        self.index = faiss.IndexFlatL2(vector_dim)  # L2 distance for similarity
        
        # Store metadata for each vector
        self.metadata: List[Dict] = []
        
        # Storage directory
        self.storage_dir = Path("vector_store_data")
        self.storage_dir.mkdir(exist_ok=True)
        
        # File paths
        self.index_path = self.storage_dir / "faiss_index.bin"
        self.metadata_path = self.storage_dir / "metadata.pkl"
        
        # Load existing index if available
        self.load_index()
    
    def create_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Create embeddings for a list of texts
        
        Args:
            texts: List of text strings
            
        Returns:
            numpy array of embeddings
        """
        embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
        return embeddings
    
    def add_conversation(
        self,
        user_email: str,
        question: str,
        response: str,
        conversation_id: Optional[int] = None
    ) -> int:
        """
        Add a conversation to the vector store
        
        Args:
            user_email: Email of the user
            question: User's question
            response: AI's response
            conversation_id: Optional database conversation ID
            
        Returns:
            Index ID of the added conversation
        """
        # Combine question and response for better context
        combined_text = f"Question: {question}\nAnswer: {response}"
        
        # Create embedding
        embedding = self.create_embeddings([combined_text])[0]
        
        # Add to FAISS index
        self.index.add(np.array([embedding], dtype=np.float32))
        
        # Store metadata
        metadata = {
            "user_email": user_email,
            "question": question,
            "response": response,
            "conversation_id": conversation_id,
            "timestamp": datetime.utcnow().isoformat(),
            "index_id": len(self.metadata)
        }
        self.metadata.append(metadata)
        
        # Save to disk
        self.save_index()
        
        return len(self.metadata) - 1
    
    def search_similar_conversations(
        self,
        query: str,
        user_email: Optional[str] = None,
        k: int = 5
    ) -> List[Dict]:
        """
        Search for similar conversations using semantic similarity
        
        Args:
            query: Search query
            user_email: Optional filter by user email
            k: Number of results to return
            
        Returns:
            List of similar conversation metadata
        """
        if self.index.ntotal == 0:
            return []
        
        # Create query embedding
        query_embedding = self.create_embeddings([query])[0]
        
        # Search in FAISS
        distances, indices = self.index.search(
            np.array([query_embedding], dtype=np.float32),
            min(k * 2, self.index.ntotal)  # Get more results for filtering
        )
        
        # Filter and format results
        results = []
        for distance, idx in zip(distances[0], indices[0]):
            if idx < len(self.metadata):
                meta = self.metadata[idx].copy()
                meta["similarity_score"] = float(1 / (1 + distance))  # Convert distance to similarity
                
                # Filter by user email if provided
                if user_email is None or meta["user_email"] == user_email:
                    results.append(meta)
                    if len(results) >= k:
                        break
        
        return results
    
    def get_relevant_context(
        self,
        query: str,
        user_email: str,
        max_results: int = 3
    ) -> str:
        """
        Get relevant context from past conversations for RAG
        
        Args:
            query: Current user query
            user_email: User's email
            max_results: Maximum number of past conversations to include
            
        Returns:
            Formatted context string
        """
        similar_convos = self.search_similar_conversations(
            query=query,
            user_email=user_email,
            k=max_results
        )
        
        if not similar_convos:
            return "No relevant past conversations found."
        
        context_parts = ["Relevant past conversations:"]
        for i, convo in enumerate(similar_convos, 1):
            context_parts.append(
                f"\n{i}. Q: {convo['question'][:100]}..."
                f"\n   A: {convo['response'][:150]}..."
                f"\n   (Similarity: {convo['similarity_score']:.2f})"
            )
        
        return "\n".join(context_parts)
    
    def get_user_history_summary(self, user_email: str, limit: int = 10) -> str:
        """
        Get a summary of user's recent conversation history
        
        Args:
            user_email: User's email
            limit: Maximum number of conversations to include
            
        Returns:
            Formatted summary string
        """
        # Filter user's conversations
        user_convos = [
            meta for meta in self.metadata
            if meta["user_email"] == user_email
        ]
        
        # Sort by timestamp (most recent first)
        user_convos.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Take only the most recent
        recent_convos = user_convos[:limit]
        
        if not recent_convos:
            return "No previous conversations found."
        
        summary_parts = [f"Your recent conversation history ({len(recent_convos)} conversations):"]
        for convo in recent_convos:
            summary_parts.append(
                f"- Q: {convo['question'][:80]}... "
                f"(at {convo['timestamp'][:10]})"
            )
        
        return "\n".join(summary_parts)
    
    def delete_user_conversations(self, user_email: str) -> int:
        """
        Delete all conversations for a specific user
        
        Args:
            user_email: User's email
            
        Returns:
            Number of conversations deleted
        """
        # Find indices to keep
        indices_to_keep = [
            i for i, meta in enumerate(self.metadata)
            if meta["user_email"] != user_email
        ]
        
        deleted_count = len(self.metadata) - len(indices_to_keep)
        
        if deleted_count > 0:
            # Rebuild index with only kept conversations
            new_index = faiss.IndexFlatL2(self.vector_dim)
            new_metadata = []
            
            for old_idx in indices_to_keep:
                # Get embedding from old index
                vector = self.index.reconstruct(old_idx)
                new_index.add(np.array([vector], dtype=np.float32))
                new_metadata.append(self.metadata[old_idx])
            
            self.index = new_index
            self.metadata = new_metadata
            self.save_index()
        
        return deleted_count
    
    def save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            # Save FAISS index
            faiss.write_index(self.index, str(self.index_path))
            
            # Save metadata
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)
            
            print(f"✅ Vector store saved: {self.index.ntotal} vectors")
        except Exception as e:
            print(f"❌ Error saving vector store: {str(e)}")
    
    def load_index(self):
        """Load FAISS index and metadata from disk"""
        try:
            if self.index_path.exists() and self.metadata_path.exists():
                # Load FAISS index
                self.index = faiss.read_index(str(self.index_path))
                
                # Load metadata
                with open(self.metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
                
                print(f"✅ Vector store loaded: {self.index.ntotal} vectors")
            else:
                print("ℹ️ No existing vector store found, starting fresh")
        except Exception as e:
            print(f"❌ Error loading vector store: {str(e)}")
            # Reset to empty state
            self.index = faiss.IndexFlatL2(self.vector_dim)
            self.metadata = []
    
    def get_stats(self) -> Dict:
        """Get statistics about the vector store"""
        user_counts = {}
        for meta in self.metadata:
            email = meta["user_email"]
            user_counts[email] = user_counts.get(email, 0) + 1
        
        return {
            "total_conversations": self.index.ntotal,
            "total_users": len(user_counts),
            "conversations_per_user": user_counts,
            "embedding_model": self.embedding_model_name,
            "vector_dimension": self.vector_dim
        }


# Create a singleton instance
vector_store_service = VectorStoreService()
