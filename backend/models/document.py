from pydantic import BaseModel

class Document(BaseModel):
    id:int
    filename:str
    upload_date:str

class SummarizerRequest(BaseModel):
    document_id:int

class SummaryResponse(BaseModel):
    summary:str