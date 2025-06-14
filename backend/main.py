from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.document_routes import router as document_router
from database import init_db
import os

app=FastAPI(title="PDF Summarization Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins={"http://localhost:3000"},
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

UPLOAD_DIR="uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.include_router(document_router,prefix="/api")

@app.get("/")
async def root():
    return {"message":"PDF Summarization Backend"}