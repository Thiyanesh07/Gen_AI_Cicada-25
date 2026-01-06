# 🌾 Gen AI Cicada-25: Farmer Assistant Application

An intelligent farmer assistant powered by Generative AI, featuring weather-based crop notifications and Retrieval-Augmented Generation (RAG) for personalized farming advice.

## ✨ Features

### 🤖 AI-Powered Chat Assistant
- **RAG System**: Retrieves relevant context from past conversations for more accurate responses
- **Vector Search**: Fast semantic search using FAISS vector database
- **Personalized Advice**: Learns from user interactions to provide tailored farming recommendations

### 🌦️ Weather-Based Crop Notifications
- **Real-time Weather Data**: Integrates with OpenWeatherMap API
- **Smart Alerts**: Generates crop-specific notifications based on weather conditions
- **Multiple Crops Supported**: Paddy, Wheat, Corn, Tomato, Cotton, Potato, Onion, and more
- **Growth Stage Awareness**: Considers crop growth stages for relevant advice

### 📊 Crop Management
- **Crop Logging**: Track crops with location, planting dates, and growth stages
- **Location-Based**: Supports GPS coordinates for precise weather data
- **CRUD Operations**: Full create, read, update, delete functionality

### 🔔 Notification System
- **Categorized Alerts**: Info, Warning, and Alert levels with color coding
- **Weather Integration**: Temperature, humidity, and condition-based notifications
- **Read/Unread Management**: Track notification status
- **Statistics Dashboard**: Overview of notification types

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI/ML**:
  - Ollama (Llama 3.2 model)
  - FAISS (Vector database)
  - Sentence Transformers
  - LangChain
- **Weather API**: OpenWeatherMap
- **Authentication**: JWT tokens

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI
- **Styling**: Modern responsive design

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with health checks
- **Networking**: Custom Docker network

## 📋 Prerequisites

- Docker and Docker Compose
- OpenWeatherMap API key (free tier available)
- Google AI API key (for frontend AI features)
- At least 4GB RAM for running Ollama models

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Thiyanesh07/Gen_AI_Cicada-25.git
cd Gen_AI_Cicada-25
```

### 2. Environment Setup
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env  # if exists

# Edit backend/.env with your API keys
OPENWEATHER_API_KEY=your_openweather_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### 3. Launch with Docker Compose
```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database**: localhost:5432

### 4. Initialize RAG System (Optional)
```bash
# Run the migration script to set up vector store
docker-compose exec backend python scripts/migrate_conversations_to_vector_store.py
```

## 📖 Usage

### Crop Management
1. Navigate to the Crop Panel
2. Add your crops with location and planting details
3. The system will automatically generate weather-based notifications

### Chat Assistant
1. Use the chat interface to ask farming questions
2. The RAG system will provide context-aware responses
3. Past conversations are stored and used for better future responses

### Notifications
1. View notifications in the Notification Widget
2. Filter by type (All, Unread) or category
3. Mark notifications as read/unread

## 🔧 API Endpoints

### Crops
- `POST /api/crops` - Create crop log
- `GET /api/crops` - List crops
- `GET /api/crops/{id}` - Get specific crop
- `PUT /api/crops/{id}` - Update crop
- `DELETE /api/crops/{id}` - Delete crop

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/{id}` - Mark read/unread
- `DELETE /api/notifications/{id}` - Delete notification
- `POST /api/notifications/generate` - Generate notifications
- `GET /api/notifications/stats` - Get statistics

### Chat
- `POST /api/chat/message` - Send message (with RAG)
- `GET /api/chat/similar` - Search similar conversations
- `GET /api/chat/context` - Get RAG context
- `GET /api/chat/vector-stats` - Vector store statistics

## 🧪 Testing

### Backend Tests
```bash
# Run RAG system tests
docker-compose exec backend python scripts/test_rag_system.py
```

### API Testing
Use tools like Postman or curl to test the endpoints:
```bash
curl -X GET "http://localhost:8000/api/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📁 Project Structure

```
Gen_AI_Cicada-25/
├── backend/                 # FastAPI backend
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   └── scripts/            # Utility scripts
├── frontend/               # React frontend
│   ├── components/         # React components
│   ├── services/           # API services
│   └── types.ts            # TypeScript types
├── docker/                 # Docker configurations
├── docker-compose.yml      # Multi-service setup
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [RAG System Guide](./RAG_IMPLEMENTATION_SUMMARY.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenWeatherMap for weather data
- Google AI for generative AI capabilities
- Ollama for local LLM hosting
- FAISS for efficient vector search

---

**Built with ❤️ for farmers worldwide**
