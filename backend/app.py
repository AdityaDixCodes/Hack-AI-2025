# backend/app.py
# Required packages:
#   pip install fastapi uvicorn[standard] python-multipart pymupdf \
#               langchain-community faiss-cpu python-dotenv tiktoken sentence-transformers

from dotenv import load_dotenv
load_dotenv()

import os
import traceback
import logging
import json
import fitz  # PyMuPDF
from typing import List, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

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

# ─────────────────────────────────────────────────────────────────────────────
# Environment variables
# ─────────────────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.error("Missing OPENROUTER_API_KEY in .env")
    raise EnvironmentError("Please set OPENROUTER_API_KEY in your .env file")

# ─────────────────────────────────────────────────────────────────────────────
# FastAPI setup
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PiFi RAG Backend",
    description="Upload an Annual Report PDF and ask it questions!",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this!
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Globals for our index & QA chain
# ─────────────────────────────────────────────────────────────────────────────
vectorstore: FAISS = None
qa_chain: RetrievalQA = None

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────
def pdf_to_text(pdf_bytes: bytes) -> str:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = [page.get_text() for page in doc]
    logger.info("Extracted text from %d pages", len(text))
    return "\n".join(text)

def build_index_and_chain(pdf_bytes: bytes):
    global vectorstore, qa_chain

    # 1) Extract text
    full_text = pdf_to_text(pdf_bytes)

    # 2) Chunk text
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(full_text)
    logger.info("Split into %d chunks", len(chunks))

    # 3) Build embeddings index
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_texts(chunks, embeddings)
    logger.info("FAISS index built")

    # 4) Setup RetrievalQA
    llm = ChatOpenAI(
        model_name="deepseek/deepseek-chat-v3-0324:free",
        openai_api_key=OPENROUTER_API_KEY,
        openai_api_base="https://openrouter.ai/api/v1",
    )
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
    )
    logger.info("RetrievalQA chain initialized")

# ─────────────────────────────────────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str
    sources: List[str]

class Metric(BaseModel):
    label: str
    value: str

# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/status")
def status():
    return {"indexed": vectorstore is not None}

# ─────────────────────────────────────────────────────────────────────────────
# 1) Upload & index PDF
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    logger.info("Upload request: %s (%s)", file.filename, file.content_type)
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    pdf_bytes = await file.read()
    try:
        build_index_and_chain(pdf_bytes)
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Indexing failed: %s\n%s", e, tb)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")
    return {"detail": "Report indexed successfully"}

# ─────────────────────────────────────────────────────────────────────────────
# 2) General QA
# ─────────────────────────────────────────────────────────────────────────────
@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    if qa_chain is None:
        raise HTTPException(status_code=400, detail="No report indexed yet.")
    try:
        result = qa_chain({"query": request.question})
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("QA error: %s\n%s", e, tb)
        raise HTTPException(status_code=500, detail=f"QA failed: {e}")
    answer = result["result"]
    sources = [doc.page_content for doc in result["source_documents"]]
    return AskResponse(answer=answer, sources=sources)

# ─────────────────────────────────────────────────────────────────────────────
# 3) Extract financial metrics
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/metrics", response_model=List[Metric])
def extract_metrics():
    """
    Automatically extract all key financial metrics from
    the indexed PDF. Returns an array of { label, value }.
    """
    if qa_chain is None:
        raise HTTPException(status_code=400, detail="No report indexed yet.")
    PROMPT = (
        'Extract all key financial metrics (label and value) from the uploaded PDF '
        'and return them as a JSON array like '
        '[{"label":"Revenue","value":"INR 355,170 Million"}, ...].'
    )
    try:
        result = qa_chain({"query": PROMPT})
        # Expect result["result"] to be JSON text
        metrics_json = result["result"].strip()
        metrics: Any = json.loads(metrics_json)
        return JSONResponse(content=metrics)
    except json.JSONDecodeError as je:
        logger.error("Failed to parse JSON from LLM: %s", je)
        raise HTTPException(status_code=500, detail="Failed to parse metrics JSON.")
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("Error extracting metrics: %s\n%s", e, tb)
        raise HTTPException(status_code=500, detail=f"Metrics extraction failed: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# Add these new models
# ─────────────────────────────────────────────────────────────────────────────
class TimeSeriesData(BaseModel):
    revenue: List[dict]
    profit: List[dict]

class SegmentData(BaseModel):
    x: str
    y: float

@app.get("/timeseries", response_model=TimeSeriesData)
def get_timeseries():
    """
    Extract time series data (revenue, profit over time) from the PDF
    """
    if qa_chain is None:
        raise HTTPException(status_code=400, detail="No report indexed yet.")
    
    PROMPT = (
        'Extract yearly revenue and profit figures from the report. Return as JSON in format: '
        '{"revenue": [{"x": "2019", "y": 1000000}, ...], '
        '"profit": [{"x": "2019", "y": 100000}, ...]}'
    )
    
    try:
        result = qa_chain({"query": PROMPT})
        data = json.loads(result["result"].strip())
        # Validate the structure
        if not isinstance(data, dict) or 'revenue' not in data or 'profit' not in data:
            raise ValueError("Invalid data structure")
        return data
    except json.JSONDecodeError as je:
        logger.error("Failed to parse JSON from LLM: %s", je)
        raise HTTPException(status_code=500, detail="Failed to parse financial data")
    except Exception as e:
        logger.error("Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/segments", response_model=List[SegmentData])
def get_segments():
    """
    Extract business segment distribution data from the PDF
    """
    if qa_chain is None:
        raise HTTPException(status_code=400, detail="No report indexed yet.")
    
    PROMPT = (
        'Extract business segment revenue distribution from the report. '
        'Return as JSON array: [{"x": "Segment Name", "y": revenue_value}, ...]'
    )
    
    try:
        result = qa_chain({"query": PROMPT})
        data = json.loads(result["result"].strip())
        # Validate the structure
        if not isinstance(data, list):
            raise ValueError("Invalid data structure")
        return data
    except json.JSONDecodeError as je:
        logger.error("Failed to parse JSON from LLM: %s", je)
        raise HTTPException(status_code=500, detail="Failed to parse segment data")
    except Exception as e:
        logger.error("Error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────────────────────────────────────
# To run:
#    uvicorn backend.app:app --reload --port 8000
# ─────────────────────────────────────────────────────────────────────────────
