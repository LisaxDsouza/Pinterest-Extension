from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/")
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Pinterest -> Product Search Engine API",
        "version": "1.0.0",
        "providers": {
            "vision": settings.VISION_PROVIDER,
            "search": settings.SEARCH_PROVIDER,
            "search_mode": settings.SEARCH_MODE
        },
        "docs": "/docs"
    }
