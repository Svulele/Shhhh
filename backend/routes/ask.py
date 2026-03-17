# backend/routes/ask.py
from fastapi import APIRouter
from backend.services.ai_engine import create_embedding
import chromadb

router = APIRouter()

@router.post("/ask")
def ask_question(question: str):
    # convert question to vector
    question_vector = create_embedding(question)
    
    # search for similar chunks
    results = collection.query(query_embeddings=[question_vector], n_results=1)
    answer_text = results['documents'][0][0]
    
    # For demo, just return the chunk
    return {"answer": answer_text}