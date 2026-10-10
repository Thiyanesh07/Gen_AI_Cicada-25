#!/usr/bin/env python3
"""
Quick test script for RAG system
Run this to verify the RAG system is working correctly
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from services.vector_store_service import vector_store_service


def test_rag_system():
    print("[TEST] Testing RAG System with FAISS Vector Store\n")
    print("=" * 60)
    
    # Test 1: Add sample conversations
    print("\n[1/5] Adding sample conversations...")
    
    test_conversations = [
        {
            "email": "test@farmer.com",
            "question": "How often should I water tomatoes?",
            "response": "Water tomatoes deeply 2-3 times per week. Ensure soil is moist but not waterlogged."
        },
        {
            "email": "test@farmer.com",
            "question": "What's the best fertilizer for rice?",
            "response": "For rice, use NPK 20-10-10 at planting, then 15-15-15 during vegetative stage."
        },
        {
            "email": "test@farmer.com",
            "question": "How to control pests on cotton plants?",
            "response": "Use neem oil spray weekly. For severe infestations, consider biological controls."
        },
    ]
    
    for convo in test_conversations:
        vector_store_service.add_conversation(
            user_email=convo["email"],
            question=convo["question"],
            response=convo["response"]
        )
        print(f"   [OK] Added: {convo['question'][:50]}...")
    
    # Test 2: Search for similar conversations
    print("\n[2/5] Testing semantic search...")
    
    test_queries = [
        "watering my tomato plants",
        "fertilizer for paddy crop",
        "pest control methods"
    ]
    
    for query in test_queries:
        print(f"\n   [QUERY] '{query}'")
        results = vector_store_service.search_similar_conversations(
            query=query,
            user_email="test@farmer.com",
            k=2
        )
        
        if results:
            for i, result in enumerate(results, 1):
                print(f"      {i}. Similarity: {result['similarity_score']:.3f}")
                print(f"         Q: {result['question'][:60]}...")
        else:
            print("      No results found")
    
    # Test 3: Get RAG context
    print("\n[3/5] Testing RAG context retrieval...")
    
    query = "How should I care for my crops?"
    context = vector_store_service.get_relevant_context(
        query=query,
        user_email="test@farmer.com",
        max_results=2
    )
    
    print(f"\n   Query: '{query}'")
    print(f"\n   Retrieved Context:")
    print("   " + "\n   ".join(context.split("\n")))
    
    # Test 4: Get statistics
    print("\n[4/5] Vector Store Statistics...")
    
    stats = vector_store_service.get_stats()
    print(f"\n   [INFO] Total Conversations: {stats['total_conversations']}")
    print(f"   [INFO] Total Users: {stats['total_users']}")
    print(f"   [INFO] Embedding Model: {stats['embedding_model']}")
    print(f"   [INFO] Vector Dimension: {stats['vector_dimension']}")
    
    # Test 5: User history summary
    print("\n[5/5] User History Summary...")
    
    summary = vector_store_service.get_user_history_summary(
        user_email="test@farmer.com",
        limit=5
    )
    print(f"\n{summary}")
    
    print("\n" + "=" * 60)
    print("[OK] RAG System Test Complete!\n")
    print("[NOTE] Your RAG system is working correctly!")
    print("[NEXT STEPS]:")
    print("   1. Start the backend server: python main.py")
    print("   2. Send a chat message via API")
    print("   3. The RAG system will automatically retrieve relevant context")
    print("\n")


if __name__ == "__main__":
    try:
        test_rag_system()
    except Exception as e:
        print(f"\n[ERROR] Error: {str(e)}")
        print("\nMake sure you have installed all dependencies:")
        print("   pip install faiss-cpu sentence-transformers langchain-huggingface")
        sys.exit(1)
