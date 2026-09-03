import os
import sys

# Add backend directory to Python sys.path so modules can be imported on Vercel
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app

# Handler for Vercel Serverless Function
handler = app
