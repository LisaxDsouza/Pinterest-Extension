import logging
from app.models.analysis import ProductAnalysis
from app.providers.vision.base import BaseVisionProvider
from app.providers.vision.mock import MockVisionProvider
from app.providers.vision.llm_vision import LLMVisionProvider
from app.config import settings

logger = logging.getLogger(__name__)


def get_vision_provider() -> BaseVisionProvider:
    provider_type = settings.VISION_PROVIDER.lower()
    if provider_type in ["gemini", "openai"]:
        return LLMVisionProvider(provider_type)
    return MockVisionProvider()


class VisionAnalyzerService:

    def __init__(self, provider: BaseVisionProvider = None):
        self.provider = provider or get_vision_provider()

    async def analyze(self, image_bytes: bytes) -> ProductAnalysis:
        # Execute provider directly without swallowing exceptions
        return await self.provider.analyze_image(image_bytes)
