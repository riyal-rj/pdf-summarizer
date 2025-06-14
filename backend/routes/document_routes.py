from fastapi import APIRouter, File,UploadFile,HTTPException
from models.document import SummarizerRequest,SummaryResponse
from services.summary_service import generate_summary
from services.pdf_service import process_pdf
from database import save_document_metadata,get_documents,get_document_filename
import os
import fitz 

router=APIRouter()

@router.post("/upload")
async def upload_pdf(file:UploadFile=File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400,detail="Only PDF files are allowed")
    
    filename=file.filename
    file_path,text=process_pdf(file.file,filename)
    doc_id=save_document_metadata(filename)

    return {"id":doc_id,"filename":filename}

@router.get("/documents")
async def list_documents():
    return get_documents()

@router.post("/summarize",response_model=SummaryResponse)
async def summarize_document(request:SummarizerRequest):
    filename=get_document_filename(request.document_id)
    if not filename:
        raise HTTPException(status_code=404,detail="Document not found")
    
    file_path=os.path.join("uploads",filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404,detail="PDF file not found")
    
    doc=fitz.open(file_path)
    text=""
    for page in doc:
        text+=page.get_text()
    doc.close()

    try:
        summary=generate_summary(request.document_id,filename,text)
        return {"summary":summary}
    except Exception as e:
        raise HTTPException(status_code=500,detail=f"Summary generation failed: {str(e)}")

