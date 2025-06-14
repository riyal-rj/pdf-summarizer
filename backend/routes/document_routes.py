from fastapi import APIRouter, File, UploadFile, HTTPException
from models.document import QuestionRequest, AnswerResponse
from services.pdf_service import process_pdf
from services.qa_service import generate_answer
from database import save_document_metadata, get_documents, get_document_filename
import os
import fitz


router = APIRouter()

@router.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    filename = file.filename
    file_path, text = process_pdf(content, filename)
    doc_id = save_document_metadata(filename)
    
    return {"id": doc_id, "filename": filename}

@router.get("/documents/")
async def list_documents():
    return get_documents()

@router.post("/ask/", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    filename = get_document_filename(request.document_id)
    if not filename:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = os.path.join("uploads", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    # Extract text again for question-answering
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    
    try:
        answer = generate_answer(request.document_id, filename, request.question, text)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question answering failed: {str(e)}")