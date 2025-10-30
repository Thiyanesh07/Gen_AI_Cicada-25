# 🌾 Farmer Query Assistant - Local AI Edition

A full-stack farmer assistant application powered by **local AI models** with complete data privacy and zero API costs.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.9+-blue)
![Node](https://img.shields.io/badge/node-18+-green)

## 🚀 What's New in v2.0

- ✅ **Local LLM Integration** - No more API costs! Runs Llama 3.2, Mistral, or other models locally via Ollama
- ✅ **FastAPI Backend** - High-performance Python backend with async support
- ✅ **PostgreSQL Database** - Store users and conversations for continuous training
- ✅ **JWT Authentication** - Secure email/password authentication
- ✅ **Training Data Export** - Export all conversations to fine-tune your own model
- ✅ **Complete Privacy** - All data stays on your machine
- ✅ **No Third-Party Dependencies** - Removed Google/GitHub OAuth
- ✅ **Zero API Costs** - Unlimited usage with local models

## 📋 Features

### 🤖 AI Capabilities
- **Natural Language Chat** - Ask farming questions, get expert advice
- **Context-Aware Responses** - LLM remembers conversation context
- **Multilingual Support** - Multiple languages supported in UI
- **Conversation History** - All chats saved for reference

### 🔐 Security
- **Email/Password Authentication** - Simple, secure user accounts
- **JWT Tokens** - Industry-standard authentication
- **Bcrypt Password Hashing** - Military-grade password security
- **SQL Injection Protection** - Safe database queries via SQLAlchemy

### 📊 Data & Training
- **Conversation Storage** - Every question/answer saved to PostgreSQL
- **Export for Training** - Download conversations in training-ready format
- **Usage Statistics** - Track your conversation patterns
- **Fine-tuning Ready** - Data structured for model fine-tuning

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration
- **Ollama** - Local model runtime
- **PostgreSQL** - Relational database
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Styling (via constants)

### AI Models
- **Llama 3.2** (Recommended) - 2GB, good balance
- **Mistral** - 4GB, higher quality
- **Phi** - 1.5GB, fastest

## 📦 Installation

### Prerequisites
- **Python 3.9+** - [Download](https://www.python.org/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL** - [Download](https://www.postgresql.org/)
- **Ollama** - [Download](https://ollama.ai/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Thiyanesh07/Gen_AI_Cicada-25.git
   cd Gen_AI_Cicada-25
   ```

2. **Install Ollama and download a model**
   ```bash
   ollama pull llama3.2
   ```

3. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE farmer_assistant_db;
   ```

4. **Setup backend**
   ```powershell
   cd backend
   .\setup.ps1
   # Edit .env file with your database credentials
   ```

5. **Setup frontend**
   ```powershell
   cd frontend
   npm install
   ```

6. **Start everything**
   ```powershell
   # From root directory
   .\start-all.ps1
   ```

7. **Open in browser**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## 📖 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Comprehensive setup instructions
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Code organization
- **[CHANGES.md](CHANGES.md)** - All changes from v1.0 to v2.0
- **[backend/README.md](backend/README.md)** - Backend-specific docs

## 🎯 Usage

### Register/Login
1. Open http://localhost:3000
2. Enter email and password
3. Click "Sign In" (auto-registers new users)

### Chat with AI
1. Navigate to Chat panel
2. Type your farming question
3. Receive AI-powered advice
4. All conversations are saved automatically

### Export Training Data
```bash
# Via API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/conversations/export?days=30

# Or use the frontend to view conversation history
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/farmer_assistant_db
SECRET_KEY=your-random-secret-key
OLLAMA_MODEL=llama3.2
```

### Frontend (apiService.ts)
```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login (returns JWT) |
| `/api/chat/message` | POST | Send chat message |
| `/api/chat/history` | GET | Get chat history |
| `/api/conversations/export` | GET | Export training data |

Full API documentation: http://localhost:8000/docs

## 🌟 Benefits

### Cost Savings
- **$0 API costs** vs $0.01-$0.10 per request with cloud APIs
- **One-time setup** vs recurring charges
- **Unlimited usage** vs rate limits

### Privacy
- **100% local** - No data sent to cloud
- **GDPR compliant** - You own all data
- **No tracking** - Complete privacy

### Control
- **Choose your model** - Llama, Mistral, Phi, or custom
- **Fine-tune easily** - Use conversation exports
- **Adjust quality/speed** - Switch models anytime

## 🚧 Roadmap

- [ ] Update ChatPanel to use new API
- [ ] Add real-time streaming responses
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Setup model fine-tuning pipeline
- [ ] Add local image generation (Stable Diffusion)
- [ ] Add local TTS (Coqui TTS)
- [ ] Add OCR for text extraction

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **Ollama** - For making local LLMs accessible
- **FastAPI** - For the amazing web framework
- **LangChain** - For LLM orchestration tools
- **React Team** - For the fantastic UI library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Thiyanesh07/Gen_AI_Cicada-25/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Thiyanesh07/Gen_AI_Cicada-25/discussions)

## 🔗 Links

- **Repository**: https://github.com/Thiyanesh07/Gen_AI_Cicada-25
- **Ollama**: https://ollama.ai/
- **FastAPI**: https://fastapi.tiangolo.com/
- **LangChain**: https://python.langchain.com/

---

Made with ❤️ for farmers worldwide
