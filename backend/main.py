from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db
from routes import auth, chat, conversations

# Initialize FastAPI app
app = FastAPI(
    title="Farmer Assistant API",
    description="Backend API for Farmer Query Assistant with local LLM",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(conversations.router)


@app.on_event("startup")
async def startup_event():
    # Initializing database
    init_db()


@app.get("/")
async def root():
    #Root endpoint
    return {
        "message": "Farmer Assistant API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
