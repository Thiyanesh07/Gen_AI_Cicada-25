#!/bin/bash
# Quick setup script for RAG system

echo "🚀 Setting up RAG System with FAISS Vector Database"
echo "=================================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install faiss-cpu==1.8.0 sentence-transformers==2.2.2 langchain-huggingface==0.1.2

# Create vector store directory
echo "📁 Creating vector store directory..."
mkdir -p vector_store_data
mkdir -p scripts

echo ""
echo "✅ Installation complete!"
echo ""
echo "🧪 Test the system:"
echo "   python scripts/test_rag_system.py"
echo ""
echo "📊 Migrate existing conversations:"
echo "   python scripts/migrate_conversations_to_vector_store.py"
echo ""
echo "🚀 Start the server:"
echo "   python main.py"
echo ""
echo "📚 Read the documentation:"
echo "   cat RAG_SYSTEM_README.md"
echo ""
