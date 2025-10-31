# RAG System with FAISS Vector Database

## 🎯 Overview

This implementation adds a **Retrieval-Augmented Generation (RAG)** system to the Farmer's AI Assistant using **FAISS** (Facebook AI Similarity Search) vector database. 

### What is RAG?
RAG enhances AI responses by retrieving relevant information from past conversations before generating a response. This allows the AI to:
- Remember context from previous chats
- Provide more personalized answers
- Reference past discussions
- Build on previous knowledge

## 🏗️ Architecture

```
User Question
    ↓
Vector Store Search (FAISS)
    ↓
Retrieve Similar Past Conversations
    ↓
Combine with Current Context
    ↓
Send to LLM (Ollama/Llama 3.2)
    ↓
Generate Enhanced Response
    ↓
Store in Vector DB for Future Use
```

## 📦 Components

### 1. **Vector Store Service** (`services/vector_store_service.py`)
- **Embedding Model**: `all-MiniLM-L6-v2` (384-dimensional embeddings)
- **FAISS Index**: L2 distance-based similarity search
- **Storage**: Persistent storage in `vector_store_data/` directory
- **Features**:
  - Add conversations automatically
  - Semantic search for similar conversations
  - User-specific filtering
  - Statistics and management

### 2. **Updated LLM Service** (`services/llm_service.py`)
- Integrated RAG context retrieval
- Automatic vector store updates
- Enhanced prompt with historical context

### 3. **Enhanced Chat Routes** (`routes/chat.py`)
- `/api/chat/message` - Now uses RAG automatically
- `/api/chat/similar` - Search similar conversations
- `/api/chat/context` - Get RAG context for a query
- `/api/chat/vector-stats` - Vector store statistics
- `/api/chat/vector-store/clear` - Clear user's vector data

## 🚀 Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The new dependencies are:
- `faiss-cpu==1.8.0` - FAISS vector database
- `sentence-transformers==2.2.2` - Embedding model
- `langchain-huggingface==0.1.2` - HuggingFace integration

### 2. Initialize Vector Store

The vector store is automatically initialized on first use. To migrate existing conversations:

```bash
cd backend
python scripts/migrate_conversations_to_vector_store.py
```

## 📝 How It Works

### Automatic RAG Process

1. **User sends a message**
   ```json
   POST /api/chat/message
   {
     "message": "How do I water my tomatoes?",
     "context": "Optional additional context"
   }
   ```

2. **System retrieves similar past conversations**
   - Converts message to 384-dimensional vector
   - Searches FAISS index for similar vectors
   - Finds top 3 most relevant past conversations
   - Filters by user email (privacy)

3. **Enhanced context is created**
   ```
   Relevant past conversations:
   1. Q: How often should I water tomatoes?
      A: Water tomatoes deeply 2-3 times per week...
      (Similarity: 0.87)
   
   2. Q: What's the best time to water plants?
      A: Early morning is ideal for watering...
      (Similarity: 0.75)
   ```

4. **LLM generates response with context**
   - Combines retrieved conversations with user query
   - Generates more informed, contextual response

5. **New conversation is stored**
   - Saved to PostgreSQL database
   - Embedded and stored in FAISS vector store
   - Available for future RAG retrievals

## 🔍 API Endpoints

### Chat with RAG
```bash
POST /api/chat/message
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "What fertilizer should I use for rice?",
  "context": "My rice is in vegetative stage"
}

Response:
{
  "response": "For rice in the vegetative stage...",
  "timestamp": "2025-10-31T10:30:00",
  "used_rag": true
}
```

### Search Similar Conversations
```bash
GET /api/chat/similar?query=watering tomatoes&limit=5
Authorization: Bearer <token>

Response:
{
  "query": "watering tomatoes",
  "results": [
    {
      "user_email": "farmer@example.com",
      "question": "How often to water tomatoes?",
      "response": "Water deeply 2-3 times per week...",
      "similarity_score": 0.89,
      "timestamp": "2025-10-30T14:20:00"
    }
  ],
  "count": 5
}
```

### Get RAG Context
```bash
GET /api/chat/context?query=pest control for rice
Authorization: Bearer <token>

Response:
{
  "query": "pest control for rice",
  "context": "Relevant past conversations:\n1. Q: How to control pests..."
}
```

### Vector Store Statistics
```bash
GET /api/chat/vector-stats
Authorization: Bearer <token>

Response:
{
  "global_stats": {
    "total_conversations": 1523,
    "total_users": 45,
    "embedding_model": "all-MiniLM-L6-v2",
    "vector_dimension": 384
  },
  "user_conversations": 87,
  "user_email": "farmer@example.com"
}
```

### Clear User's Vector Data
```bash
DELETE /api/chat/vector-store/clear
Authorization: Bearer <token>

Response:
{
  "message": "Cleared 87 conversations from vector store",
  "deleted_count": 87
}
```

## 💾 Data Storage

### Directory Structure
```
backend/
├── vector_store_data/
│   ├── faiss_index.bin       # FAISS index file
│   └── metadata.pkl          # Conversation metadata
├── services/
│   ├── vector_store_service.py
│   └── llm_service.py
└── scripts/
    └── migrate_conversations_to_vector_store.py
```

### What Gets Stored?

**FAISS Index**: 
- 384-dimensional embeddings of conversations
- Fast similarity search

**Metadata**: 
- User email
- Question text
- Response text
- Conversation ID (links to SQL DB)
- Timestamp
- Index ID

## 🔒 Privacy & Security

- **User Isolation**: Each user only sees their own conversations in RAG
- **Secure Storage**: Vector data is stored locally on your server
- **User Control**: Users can clear their vector data anytime
- **No Data Leakage**: Similarity search filters by user email

## 🎛️ Configuration

### Embedding Model
Change in `vector_store_service.py`:
```python
vector_store_service = VectorStoreService(
    embedding_model="all-MiniLM-L6-v2",  # Fast, good quality
    # Other options:
    # "all-mpnet-base-v2"  # Better quality, slower
    # "paraphrase-multilingual-MiniLM-L12-v2"  # Multilingual
)
```

### Number of Retrieved Conversations
Change in `llm_service.py`:
```python
rag_context = self.vector_store.get_relevant_context(
    query=question,
    user_email=user_email,
    max_results=3  # Adjust this number
)
```

## 📊 Performance

### Embedding Model Performance
- **Model**: all-MiniLM-L6-v2
- **Dimension**: 384
- **Speed**: ~500 sentences/second on CPU
- **Size**: ~80MB

### FAISS Performance
- **Search Time**: <10ms for 10,000 vectors
- **Memory**: ~1.5KB per conversation
- **Scalability**: Handles millions of vectors

## 🐛 Troubleshooting

### Module Not Found Errors
```bash
pip install faiss-cpu sentence-transformers langchain-huggingface
```

### Slow First Request
The embedding model loads on first use (~2-3 seconds). Subsequent requests are fast.

### Vector Store Not Persisting
Check that the `vector_store_data/` directory is writable.

### Migration Script Errors
Ensure your `.env` file has the correct `TRAINING_DATABASE_URL`.

## 🚀 Advanced Usage

### Batch Adding Conversations
```python
from services.vector_store_service import vector_store_service

# Add multiple conversations at once
conversations = [
    ("How to plant rice?", "Plant in rows with 6-inch spacing..."),
    ("Best fertilizer for wheat?", "Use NPK 20-10-10 at planting..."),
]

for question, response in conversations:
    vector_store_service.add_conversation(
        user_email="farmer@example.com",
        question=question,
        response=response
    )
```

### Custom Similarity Threshold
```python
results = vector_store_service.search_similar_conversations(
    query="pest control",
    user_email="farmer@example.com",
    k=10
)

# Filter by similarity score
high_relevance = [
    r for r in results 
    if r['similarity_score'] > 0.8
]
```

## 📚 References

- [FAISS Documentation](https://github.com/facebookresearch/faiss)
- [Sentence Transformers](https://www.sbert.net/)
- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)

## ✨ Benefits

1. **Better Responses**: AI learns from past interactions
2. **Personalization**: Each user gets contextual responses
3. **Memory**: System remembers what users have discussed
4. **Efficiency**: Fast semantic search with FAISS
5. **Scalability**: Handles thousands of conversations
6. **Privacy**: User-specific conversation retrieval

---

**Your AI assistant now has memory! 🧠✨**
