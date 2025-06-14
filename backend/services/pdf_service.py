import os
import fitz  # PyMuPDF
from fastapi import HTTPException

UPLOAD_DIR = "uploads"

def process_pdf(file_content: bytes, filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Extract text
        doc = fitz.open("pdf", file_content)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        return file_path, text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")