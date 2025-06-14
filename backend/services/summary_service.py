from langchain_huggingface.embeddings.huggingface import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFacePipeline
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain.chains.summarize import load_summarize_chain
import os

embeddings=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm=HuggingFacePipeline.from_model_id(
    model_id="facebook/bart-large-cnn",
    task="summarization",
    pipeline_kwargs={"max_length":200,"min_length":30}
)

text_splitter=RecursiveCharacterTextSplitter(chunk_size=1000,chunk_overlap=200)

def generate_summary(doc_id:int,filename:str,text:str):
    texts=text_splitter.split_text(text)
    vectorstore=FAISS.from_texts(texts,embeddings)
    vectorstore.save_local(os.path.join("uploads","f{filename}.faiss"))

    doc=Document(page_content=text)

    chain=load_summarize_chain(llm,chain_type="map_reduce")

    summary=chain.run([doc])
    return summary