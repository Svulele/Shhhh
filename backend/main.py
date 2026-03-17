from fastapi import FastAPI, UploadFile
from ai.reader import ingest_book, ask_book

import shutil

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Shhhh AI running"}
@app.post("/upload")
async def upload_book(file: UploadFile):
    try:
        path = f"uploads/{file.filename}"

        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = ingest_book(path)

        return {"status": result}
    
    except Exception as e:
        return {"error": str(e)}

@app.get("/ask")
def ask(question: str):
    try:
        answer = ask_book(question)
        return {"answer": answer}
    
    except Exception as e:
        return {"error": str(e)}