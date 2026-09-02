# 📌 Pinterest → Visual Marketplace Product Finder

A full-stack Chrome Extension (Manifest V3) and Python FastAPI backend that allows users to crop any object from a Pinterest pin image, analyze visual attributes using **Google Gemini Vision AI (`gemini-3.6-flash`)**, and instantly discover matching product listings across major Indian marketplaces (**Amazon.in**, **Flipkart**, **IKEA**, **Myntra**, **Pepperfry**).

---

## ✨ Features

- **Interactive Pinterest Image Cropping**: Hover on any Pinterest image to click "Find Similar" or use the manual "Crop Object" tool in the side panel. Red selection box with exact `object-fit: cover` pixel calculation.
- **Cross-Origin Canvas Taint Fix**: Automatically fetches Pinterest images as Blobs via Chrome extension host permissions to bypass canvas cross-origin security errors.
- **Image Preprocessing & Downscaling Engine**: Pillow (`PIL`) image preprocessor downscales cropped image bytes to a max dimension of 512px maintaining aspect ratio at 80% JPEG quality. **Cuts payload size by ~90-95%** for hyper-fast LLM inference.
- **Google Gemini 3.6 Flash Vision AI**: Powered by `google-genai` SDK with disabled AFC warning. Extracts exact item category, visual description, color, material, style, shape, finish, and usage attributes.
- **100% LLM Backend & Working Marketplace Links**: Generates working live product search landing URLs directly for Amazon.in, Flipkart, IKEA, Myntra, and Pepperfry without breaking or returning 404s.
- **Ranked Candidate Scoring**: Relevance scoring based on category match (30%), attribute overlap (30%), and text similarity (40%).

---

## 🛠 Tech Stack

### Chrome Extension (Frontend)
- **Manifest V3** with `sidePanel`, `activeTab`, `scripting`, and `storage` permissions.
- **React 18** + **TypeScript** + **TailwindCSS**.
- **Vite** build pipeline.

### FastAPI Backend
- **Python 3.13** + **FastAPI** + **Uvicorn**.
- **Google GenAI SDK** (`google-genai`) for Gemini 3.6 Flash.
- **Pillow** (`PIL`) for high-performance image downscaling & compression.
- **Pytest** test suite (9/9 automated unit tests passing).

---

## 📁 Repository Structure

```text
Pinterest Extension/
├── extension/                     # Chrome Extension (MV3 React + Vite)
│   ├── src/
│   │   ├── background/            # Service worker (side panel opener & cache)
│   │   ├── content/               # Content script (Pinterest pin image detector)
│   │   ├── components/            # ImageSelector crop overlay, ProductCard, Results
│   │   ├── pages/                 # SidePanel React UI
│   │   ├── api/                   # API client calling http://localhost:8000/api/search
│   │   └── types/                 # TypeScript interfaces
│   ├── manifest.json
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                       # FastAPI Backend Engine
│   ├── app/
│   │   ├── main.py                # FastAPI app & CORS middleware
│   │   ├── config.py              # Pydantic BaseSettings (.env configuration)
│   │   ├── api/
│   │   │   ├── routes_search.py   # POST /api/search endpoint
│   │   │   └── routes_health.py   # GET /health check
│   │   ├── models/                # Pydantic schemas (ProductAnalysis, SearchResponse)
│   │   ├── services/              # VisionAnalyzer, ProductRanker, DirectSearch
│   │   ├── providers/             # LLMVisionProvider (Gemini 3.6 Flash) & Mock fallbacks
│   │   └── utils/                 # image_processor.py & url_utils.py
│   ├── tests/                     # Pytest automated test suite
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env                       # Environment variables (API keys)
│   └── README.md
│
├── .gitignore                     # Root gitignore
└── README.md                      # Root documentation
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure backend/.env
# Copy .env.example to .env and add your Gemini API key from https://aistudio.google.com/
VISION_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# 4. Start FastAPI Backend Server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be live at `http://127.0.0.1:8000` (Interactive API Docs at `http://127.0.0.1:8000/docs`).

### 2. Run Backend Unit Tests

```bash
cd backend
python -m pytest
```

---

### 3. Extension Setup (Chrome)

```bash
# 1. Navigate to extension directory
cd extension

# 2. Install dependencies & build
npm install
npm run build
```

#### Load into Chrome:
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `extension/dist/` folder.
4. Open any pin on Pinterest (e.g. `pinterest.com/pin/...`), hover over an image or click the side panel icon, crop an object, and view instant marketplace product matches!

---

## 🔑 Environment Variables (`backend/.env`)

```env
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["*"]

# Vision AI Configuration
VISION_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...

# Strategy & Limits
MAX_QUERIES=4
MAX_RESULTS_PER_QUERY=5
MAX_MARKETPLACES=3
```

---

## 📝 License

MIT License. Developed for Pinterest Visual Shopping Discovery.
