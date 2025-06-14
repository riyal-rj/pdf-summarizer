import os
import fitz
import shutil

UPLOAD_DIR="uploads"

def process_pdf(file,filename:str):
    file_path=os.path.join(UPLOAD_DIR,filename)
    with open(file_path,"wb") as buffer:
        shutil.copyfileobj(file,buffer)

    doc=fitz.open(file_path)
    text=""
    for page in doc:
        text+=page.get_text()
    doc.close()

    return file_path,text