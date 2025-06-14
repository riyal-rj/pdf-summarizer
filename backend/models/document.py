from pydantic import BaseModel

class Document(BaseModel):
    id: int
    filename: str
    upload_date: str

class QuestionRequest(BaseModel):
    document_id: int
    question: str

class AnswerResponse(BaseModel):
    answer: str