import re
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from transformers import pipeline
import os
from fastapi import HTTPException

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize QA pipeline with a model fine-tuned for question-answering
qa_pipeline = pipeline(
    "question-answering",
    model="deepset/roberta-base-squad2",
    tokenizer="deepset/roberta-base-squad2",
    device=0 if os.environ.get("CUDA_VISIBLE_DEVICES") != "" else -1  # Use GPU if available
)

# Text splitter with larger chunk size for more context
text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=150)

def clean_text(text: str) -> str:
    """
    Clean the extracted PDF text by removing special characters, extra spaces, and formatting issues.
    """
    # Replace special characters and LaTeX symbols
    text = re.sub(r'\$\s*\\[^\s]+\s*\$', ' ', text)  # Remove LaTeX symbols like $\square$, $\mathbf{R}^2$
    text = re.sub(r'[^\w\s\d\.\,\-\(\)\:\;\!\?]', ' ', text)  # Keep alphanumeric, spaces, and basic punctuation
    # Normalize phone numbers (e.g., "J 8334826325" -> "8334826325")
    text = re.sub(r'J\s*(\d{10})', r'\1', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def synthesize_detailed_answer(question: str, docs: list) -> str:
    """
    Synthesize a detailed answer by combining relevant information from retrieved chunks.
    """
    context = " ".join([doc.page_content for doc in docs])
    print("Retrieved context:", context)
    
    # Use the QA pipeline to extract a primary answer
    qa_result = qa_pipeline(question=question, context=context)
    primary_answer = qa_result["answer"]
    
    # Determine if the question requires a detailed response (e.g., "Tell me about", "Describe", "What projects")
    detailed_keywords = ["tell me about", "describe", "what projects", "what technologies"]
    is_detailed = any(keyword in question.lower() for keyword in detailed_keywords)
    
    if not is_detailed:
        return primary_answer
    
    # Synthesize a more detailed answer by including additional context
    detailed_answer = f"{primary_answer}\n\nDetails:\n"
    
    if "projects" in question.lower():
        # Extract project-related information from all chunks
        project_sections = []
        for doc in docs:
            content = doc.page_content
            if any(proj in content for proj in ["Stokis", "GadgyHub", "Advanced Authentication", "TriNayan"]):
                project_sections.append(content)
        if project_sections:
            detailed_answer += "\n".join(project_sections)
        else:
            detailed_answer += "No additional project details found."
    
    elif "technologies" in question.lower():
        # Extract technology-related information
        tech_sections = []
        for doc in docs:
            content = doc.page_content
            if any(tech in content for tech in ["React", "Node.js", "MongoDB", "Python", "YOLOv8"]):
                tech_sections.append(content)
        if tech_sections:
            detailed_answer += "\n".join(tech_sections)
        else:
            detailed_answer += "No additional technology details found."
    
    else:
        # For other detailed questions, include the full context
        detailed_answer += context
    
    return detailed_answer

def generate_answer(doc_id: int, filename: str, question: str, text: str):
    try:
        # Clean the extracted text
        cleaned_text = clean_text(text)
        
        # Split text into chunks
        texts = text_splitter.split_text(cleaned_text)
        if not texts:
            raise ValueError("No text chunks created from the document")
        
        # Create FAISS index
        vectorstore = FAISS.from_texts(texts, embeddings)
        vectorstore.save_local(os.path.join("uploads", f"{filename}.faiss"))
        
        # Load vectorstore
        vectorstore = FAISS.load_local(os.path.join("uploads", f"{filename}.faiss"), embeddings, allow_dangerous_deserialization=True)
        
        # Retrieve relevant chunks (top 5 for more context)
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        docs = retriever.get_relevant_documents(question)
        
        # Check if any documents were retrieved
        if not docs:
            raise ValueError("No relevant context retrieved for the question")
        
        # Synthesize a detailed answer
        answer = synthesize_detailed_answer(question, docs)
        
        return answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")