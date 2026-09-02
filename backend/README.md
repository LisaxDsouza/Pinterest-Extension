# Pinterest → Product Search Engine API

Production-quality FastAPI backend engine that accepts cropped Pinterest images, analyzes visual features using Vision AI, generates multi-faceted shopping search queries, searches the web via configurable providers (Brave, SerpAPI, or Mock), classifies product candidates into marketplaces (Amazon.in, Flipkart, IKEA, Myntra, Pepperfry), normalizes & deduplicates URLs, ranks products by relevance, and generates direct marketplace search links.

---

## 🏗 System Architecture

```text
Cropped Pinterest Image
        │
        ▼
   Vision Analyzer (Category, Description, Color, Material, Style, Shape, Finish, Usage)
        │
        ▼
   Query Generator (3-5 Multi-faceted Shopping Queries)
        │
        ▼
   Web Search Engine (Brave Search / SerpAPI / Mock)
        │
        ▼
   Marketplace Classifier (Amazon.in, Flipkart, IKEA, Myntra, Pepperfry, Other)
        │
        ▼
   Candidate Processor (URL Normalization & ASIN Deduplication)
        │
        ▼
   Product Ranker (Semantic 40% + Attribute 30% + Category 30%)
        │
        ▼
   Search Response (Ranked Candidates + Direct Marketplace Search URLs)
```

---

## ⚡ Tech Stack & Modules

* **Framework**: FastAPI + Uvicorn + Pydantic V2
* **HTTP Client**: `httpx` (async)
* **Image Processing**: `Pillow`
* **Test Suite**: `pytest` & `pytest-asyncio`

### Folder Structure
```text
backend/
├── app/
│   ├── main.py                    # FastAPI app & CORS configuration
│   ├── config.py                  # Pydantic BaseSettings (.env loader)
│   ├── api/
│   │   ├── routes_search.py       # POST /api/search
│   │   └── routes_health.py       # GET /health & GET /
│   ├── models/
│   │   ├── analysis.py            # ProductAnalysis & ProductAttributes
│   │   ├── search.py              # SearchQuery & SearchResult
│   │   └── product.py             # ProductCandidate & SearchResponse
│   ├── services/
│   │   ├── vision_analyzer.py     # Vision AI orchestrator
│   │   ├── query_generator.py     # Shopping query generator
│   │   ├── search_engine.py       # Async web search executor
│   │   ├── marketplace_classifier.py # Domain & URL classifier
│   │   ├── candidate_processor.py # Deduplication & URL normalizer
│   │   ├── product_ranker.py      # Relevance & attribute ranker
│   │   └── direct_search.py       # Direct landing page search URLs
│   ├── providers/
│   │   ├── vision/ (base.py, llm_vision.py, mock.py)
│   │   └── search/ (base.py, brave.py, serpapi.py, mock.py)
│   └── utils/
│       └── url_utils.py           # ASIN canonicalizer & parameter stripper
├── tests/                         # Full automated test suite
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🚀 Local Quickstart

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Configure Environment Variables (`.env`)
```env
# Default runs 100% Mock Mode locally without any API keys!
SEARCH_PROVIDER=mock
VISION_PROVIDER=mock

# Optional Real Provider Keys
BRAVE_API_KEY=
SERPAPI_API_KEY=
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### 3. Run Backend Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Run Test Suite
```bash
python -m pytest
```

---

## 📡 API Usage & Interactive Docs

* **Swagger UI**: `http://127.0.0.1:8000/docs`
* **Health Check**: `GET http://127.0.0.1:8000/health`
* **Product Search Endpoint**: `POST http://127.0.0.1:8000/api/search`

### Example `curl` Command:
```bash
curl -X POST \
  http://127.0.0.1:8000/api/search \
  -F "image=@sample_crop.jpg" \
  -F "marketplaces=amazon,flipkart,ikea" \
  -F "max_results=10"
```

---

## 🔒 Security & Privacy Notice
* No scraping of Amazon or Flipkart product pages.
* All credentials remain on the backend `.env`.
* Full local mock fallback enabled when API keys are absent.
