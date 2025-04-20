# backend/app.py
# Required packages:
#   pip install fastapi uvicorn[standard] python-multipart pymupdf \
#               langchain-community faiss-cpu python-dotenv tiktoken sentence-transformers

from dotenv import load_dotenv
load_dotenv()  # load environment variables from .env

import os
import traceback
import logging
import fitz  # PyMuPDF
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA

# ─────────────────────────────────────────────────────────────────────────────
# Logging setup
# ─────────────────────────────────────────────────────────────────────────────
logger = logging.getLogger("pifi_backend")
logger.setLevel(logging.INFO)
# If Uvicorn is used, its logger will capture these messages too.

# ─────────────────────────────────────────────────────────────────────────────
# Environment variables:
#   - OPENROUTER_API_KEY  (for chat via OpenRouter)
# ─────────────────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.error("Missing OPENROUTER_API_KEY in .env")
    raise EnvironmentError("Please set OPENROUTER_API_KEY in your .env file")

# ─────────────────────────────────────────────────────────────────────────────
# App & CORS setup
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PiFi RAG Backend",
    description="Upload an Annual Report PDF and ask it questions!",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # in production, restrict to your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Globals to hold our vectorstore & chain
# ─────────────────────────────────────────────────────────────────────────────
vectorstore: FAISS = None
qa_chain: RetrievalQA = None


# ─────────────────────────────────────────────────────────────────────────────
# Helper: parse PDF → text
# ─────────────────────────────────────────────────────────────────────────────
def pdf_to_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = [page.get_text() for page in doc]
    logger.info("Extracted text from %d pages", len(pages))
    return "\n".join(pages)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: build the FAISS index & QA chain
# ─────────────────────────────────────────────────────────────────────────────
def build_index_and_chain(pdf_bytes: bytes):
    global vectorstore, qa_chain

    logger.info("Starting to build index for report (%d bytes)", len(pdf_bytes))
    full_text = pdf_to_text(pdf_bytes)

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(full_text)
    logger.info("Split text into %d chunks", len(chunks))

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_texts(chunks, embeddings)
    logger.info("Built FAISS index with %d embeddings", len(chunks))

    llm = ChatOpenAI(
        model_name="deepseek/deepseek-chat-v3-0324:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
    )
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True
    )
    logger.info("RetrievalQA chain initialized")


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: List[str]


# ─────────────────────────────────────────────────────────────────────────────
# Health: is an index loaded?
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/status")
def status():
    indexed = vectorstore is not None
    logger.debug("/status → %s", indexed)
    return {"indexed": indexed}


# ─────────────────────────────────────────────────────────────────────────────
# 1) Upload & index an Annual Report
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    logger.info("Received upload request: filename=%s, content_type=%s", file.filename, file.content_type)
    if file.content_type != "application/pdf":
        logger.warning("Rejected upload: not a PDF (%s)", file.content_type)
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    pdf_bytes = await file.read()
    try:
        build_index_and_chain(pdf_bytes)
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Indexing failed: %s\n%s", e, tb)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")
    logger.info("Upload and indexing succeeded")
    return {"detail": "Report indexed successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# 2) Ask a question of the indexed report
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    logger.info("Received question: %s", request.question)
    if qa_chain is None:
        logger.warning("Ask called before indexing")
        raise HTTPException(status_code=400, detail="No report indexed yet. Upload first.")
    try:
        result = qa_chain({"query": request.question})
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Error during QA: %s\n%s", e, tb)
        raise HTTPException(status_code=500, detail=f"QA failed: {e}")

    answer = result["result"]
    sources = [doc.page_content for doc in result["source_documents"]]
    logger.info("Returning answer (length=%d) with %d sources", len(answer), len(sources))
    return AskResponse(answer=answer, sources=sources)


# ─────────────────────────────────────────────────────────────────────────────
# Run with:
#    uvicorn backend.app:app --reload --port 8000
# ─────────────────────────────────────────────────────────────────────────────
