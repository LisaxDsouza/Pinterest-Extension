from PIL import Image
import io
import logging
from app.models.analysis import ProductAnalysis, ProductAttributes
from app.providers.vision.base import BaseVisionProvider

logger = logging.getLogger(__name__)


class MockVisionProvider(BaseVisionProvider):

    async def analyze_image(self, image_bytes: bytes) -> ProductAnalysis:
        """
        Dynamically analyzes cropped image features (aspect ratio, brightness, color variance)
        to return realistic, item-specific ProductAnalysis payloads.
        """
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            w, h = pil_img.size
            ar = w / float(h)

            # Sample average brightness across pixels
            stat_data = pil_img.stat if hasattr(pil_img, 'stat') else None
            if not stat_data:
                from PIL import ImageStat
                stat_data = ImageStat.Stat(pil_img)

            avg_r, avg_g, avg_b = stat_data.mean[:3]
            brightness = (avg_r + avg_g + avg_b) / 3.0

            logger.info(f"MockVision: width={w}, height={h}, AR={ar:.2f}, brightness={brightness:.1f}")

            # 1. Wide light-colored board / calendar (e.g. whiteboard, grid board, planner)
            if ar >= 1.05 and brightness > 120:
                return ProductAnalysis(
                    category="magnetic whiteboard calendar",
                    description="aesthetic white magnetic monthly calendar board for wall organization",
                    attributes=ProductAttributes(
                        color=["white", "black"],
                        material=["metal", "whiteboard"],
                        style=["minimalist", "modern"],
                        shape=["rectangular"],
                        finish=["smooth"],
                        usage=["wall", "office", "study"]
                    ),
                    search_terms=[
                        "magnetic whiteboard calendar for wall",
                        "aesthetic monthly planner board",
                        "whiteboard wall calendar board",
                        "magnetic memo board organizer"
                    ]
                )

            # 2. Tall dark vertical object (e.g. desk lamp, standing light)
            elif ar < 0.85 and brightness < 110:
                return ProductAnalysis(
                    category="desk lamp",
                    description="minimalist black metal desk lamp with an arched neck",
                    attributes=ProductAttributes(
                        color=["black"],
                        material=["metal"],
                        style=["minimalist", "modern"],
                        shape=["arched"],
                        finish=["matte"],
                        usage=["desk", "study"]
                    ),
                    search_terms=[
                        "black minimalist desk lamp",
                        "modern black study lamp",
                        "matte black metal desk lamp",
                        "arched desk lamp"
                    ]
                )

            # 3. Tall colorful / bright object (e.g. wall art posters, prints)
            elif ar < 0.85 and brightness >= 110:
                return ProductAnalysis(
                    category="aesthetic wall art posters",
                    description="vintage aesthetic photo collage wall art prints set",
                    attributes=ProductAttributes(
                        color=["beige", "multicolor"],
                        material=["paper", "cardstock"],
                        style=["vintage", "boho", "aesthetic"],
                        shape=["rectangular"],
                        finish=["matte"],
                        usage=["wall", "bedroom"]
                    ),
                    search_terms=[
                        "aesthetic wall collage kit",
                        "vintage room decor posters",
                        "wall art prints for bedroom",
                        "aesthetic photo collage set"
                    ]
                )

            # 4. Square / Medium object (e.g. desk organizer, pegboard, storage box)
            else:
                return ProductAnalysis(
                    category="desk organizer",
                    description="aesthetic white desk stationery organizer container",
                    attributes=ProductAttributes(
                        color=["white", "grey"],
                        material=["plastic", "acrylic"],
                        style=["minimalist"],
                        shape=["square"],
                        finish=["matte"],
                        usage=["desk", "storage"]
                    ),
                    search_terms=[
                        "aesthetic desk organizer",
                        "stationery storage box container",
                        "desktop pen holder organizer",
                        "minimalist desk storage"
                    ]
                )

        except Exception as e:
            logger.warning(f"Error parsing image metrics in MockVisionProvider: {e}")

        # Fallback default
        return ProductAnalysis(
            category="desk lamp",
            description="minimalist black metal desk lamp",
            attributes=ProductAttributes(
                color=["black"],
                material=["metal"],
                style=["minimalist", "modern"],
                shape=["arched"],
                finish=["matte"],
                usage=["desk", "study"]
            ),
            search_terms=[
                "black minimalist desk lamp",
                "modern black study lamp",
                "matte black metal desk lamp"
            ]
        )
