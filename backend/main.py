from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.document_routes import router as document_router
from database import init_db
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF Question-Answering Backend")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Include routes
app.include_router(document_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "PDF Question-Answering Backend"}