"""Bounded, ephemeral PDF search. No model downloads or external AI requests."""
from io import BytesIO
import re
import secrets
import threading
import time
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel, Field
from pypdf import PdfReader

app = FastAPI(title="Shhhh study API")
MAX_BYTES = 8 * 1024 * 1024
TTL = 1800
sessions = {}
lock = threading.Lock()

@app.middleware("http")
async def privacy_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

def prune():
    now = time.monotonic()
    for token in list(sessions):
        if sessions[token][0] <= now:
            del sessions[token]

@app.get("/")
def home():
    return {"message": "Shhhh study search running"}

@app.post("/upload")
def upload_book(file: UploadFile = File(...), consent: bool = Form(...)):
    try:
        if not consent:
            raise HTTPException(400, "Permission to process this document is required.")
        data = file.file.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise HTTPException(413, "Choose a PDF smaller than 8 MB.")
        if not data.startswith(b"%PDF-"):
            raise HTTPException(415, "Choose a valid PDF document.")
        with lock:
            prune()
            if len(sessions) >= 20:
                raise HTTPException(503, "Study capacity is full. Try again later.")
            try:
                reader = PdfReader(BytesIO(data))
                if reader.is_encrypted:
                    raise HTTPException(422, "Choose an unencrypted PDF.")
                if len(reader.pages) > 150:
                    raise HTTPException(413, "Choose a PDF with at most 150 pages.")
                pages = []
                total = 0
                for number, page in enumerate(reader.pages, 1):
                    text = page.extract_text() or ""
                    total += len(text)
                    if total > 500_000:
                        raise HTTPException(413, "This PDF contains too much text. Upload a smaller section.")
                    if text.strip():
                        pages.append((number, text))
            except HTTPException:
                raise
            except Exception:
                raise HTTPException(422, "This PDF could not be read. Try another PDF.")
            if not pages:
                raise HTTPException(422, "No readable text found. Scanned PDFs need OCR before upload.")
            token = secrets.token_urlsafe(32)
            sessions[token] = (time.monotonic() + TTL, pages)
        return {"token": token, "pages": len(pages), "expires_in": TTL}
    finally:
        file.file.close()

class Question(BaseModel):
    question: str = Field(min_length=2, max_length=500)

@app.post("/ask")
def ask(body: Question, authorization: str = Header(default="")):
    token = authorization.removeprefix("Bearer ")
    with lock:
        prune()
        session = sessions.get(token)
        if not session:
            raise HTTPException(401, "Your document session expired. Upload it again.")
        pages = session[1]
    words = set(re.findall(r"\w{3,}", body.question.lower())) - {"the", "and", "what", "how", "does", "this", "that", "are", "for"}
    if not words:
        raise HTTPException(400, "Include a specific topic to search for.")
    ranked = []
    for page, text in pages:
        for start in range(0, len(text), 900):
            excerpt = text[start:start + 1100]
            score = len(words & set(re.findall(r"\w{3,}", excerpt.lower())))
            if score:
                ranked.append((score, page, excerpt))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return {"matches": [{"page": p, "text": t} for _, p, t in ranked[:3]]}

@app.delete("/document", status_code=204)
def delete_document(authorization: str = Header(default="")):
    with lock:
        sessions.pop(authorization.removeprefix("Bearer "), None)

# A Docker deployment serves the built frontend and API on the same origin.
# Local development keeps the original API endpoints for the Vite proxy.
from pathlib import Path
from fastapi.staticfiles import StaticFiles

public_directory = Path(__file__).resolve().parent / "public"
if public_directory.is_dir():
    api = app
    app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
    app.mount("/api", api)
    app.mount("/", StaticFiles(directory=str(public_directory), html=True), name="frontend")
