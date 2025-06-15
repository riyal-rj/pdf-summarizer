from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import pickle
import os

class EmbeddingService:
    def __init__(self):
        self.model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=300)  # Smaller chunks, more overlap
        self.vector_store_path = "faiss_index"
        self.chunks_path = "chunks.pkl"

    def create_embeddings(self, text: str, doc_id: int) -> None:
        chunks = self.text_splitter.split_text(text)
        
        with open(f"{self.chunks_path}_{doc_id}", "wb") as f:
            pickle.dump(chunks, f)
        
        vector_store = FAISS.from_texts(chunks, embedding=self.model)
        vector_store.save_local(f"{self.vector_store_path}_{doc_id}")

    def load_vector_store(self, doc_id: int):
        return FAISS.load_local(f"{self.vector_store_path}_{doc_id}", self.model, allow_dangerous_deserialization=True)

    def load_chunks(self, doc_id: int) -> list[str]:
        with open(f"{self.chunks_path}_{doc_id}", "rb") as f:
            return pickle.load(f)