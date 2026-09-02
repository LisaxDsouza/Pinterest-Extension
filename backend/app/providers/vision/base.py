from abc import ABC, abstractmethod
from app.models.analysis import ProductAnalysis


class BaseVisionProvider(ABC):

    @abstractmethod
    async def analyze_image(self, image_bytes: bytes) -> ProductAnalysis:
        """
        Accepts cropped image bytes and returns structured ProductAnalysis.
        """
        pass
