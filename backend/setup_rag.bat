@echo off
REM Quick setup script for RAG system (Windows)

echo 🚀 Setting up RAG System with FAISS Vector Database
echo ==================================================
echo.

REM Check if we're in the backend directory
if not exist "requirements.txt" (
    echo ❌ Error: Please run this script from the backend directory
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install faiss-cpu==1.8.0 sentence-transformers==2.2.2 langchain-huggingface==0.1.2

REM Create vector store directory
echo 📁 Creating vector store directory...
if not exist "vector_store_data" mkdir vector_store_data
if not exist "scripts" mkdir scripts

echo.
echo ✅ Installation complete!
echo.
echo 🧪 Test the system:
echo    python scripts\test_rag_system.py
echo.
echo 📊 Migrate existing conversations:
echo    python scripts\migrate_conversations_to_vector_store.py
echo.
echo 🚀 Start the server:
echo    python main.py
echo.
echo 📚 Read the documentation:
echo    type RAG_SYSTEM_README.md
echo.

pause
