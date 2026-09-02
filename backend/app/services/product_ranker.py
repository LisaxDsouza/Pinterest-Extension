from abc import ABC, abstractmethod
from typing import List, Tuple
from app.models.analysis import ProductAnalysis
from app.models.product import ProductCandidate


class EmbeddingProvider(ABC):

    @abstractmethod
    async def embed_image(self, image_bytes: bytes) -> List[float]:
        pass

    @abstractmethod
    async def similarity(self, image_a: bytes, image_b: bytes) -> float:
        pass


class MockEmbeddingProvider(EmbeddingProvider):

    async def embed_image(self, image_bytes: bytes) -> List[float]:
        return [0.1] * 128

    async def similarity(self, image_a: bytes, image_b: bytes) -> float:
        return 0.85


class ProductRankerService:

    def rank(
        self,
        analysis: ProductAnalysis,
        candidates: List[ProductCandidate]
    ) -> List[ProductCandidate]:
        """
        Ranks candidates based on text relevance (40%), attribute match (30%),
        and category match (30%).
        """
        category = analysis.category.lower()
        attr_colors = [c.lower() for c in analysis.attributes.color]
        attr_materials = [m.lower() for m in analysis.attributes.material]
        attr_styles = [s.lower() for s in analysis.attributes.style]

        ranked: List[ProductCandidate] = []

        for candidate in candidates:
            title_text = (candidate.title + " " + (candidate.snippet or "")).lower()
            reasons = []

            # 1. Category similarity score (0.0 to 1.0)
            category_score = 0.0
            cat_words = [w for w in category.split() if len(w) > 2]
            matched_cat_words = [w for w in cat_words if w in title_text]
            if matched_cat_words:
                category_score = len(matched_cat_words) / len(cat_words)
                reasons.append("Same product category")
            else:
                category_score = 0.2

            # 2. Attribute similarity score (0.0 to 1.0)
            attr_matches = 0
            total_attrs = len(attr_colors) + len(attr_materials) + len(attr_styles)

            for c in attr_colors:
                if c in title_text:
                    attr_matches += 1
                    reasons.append(f"{c.title()} color match")

            for m in attr_materials:
                if m in title_text:
                    attr_matches += 1
                    reasons.append(f"Similar {m} material")

            for s in attr_styles:
                if s in title_text:
                    attr_matches += 1
                    reasons.append(f"Matching {s} style")

            attribute_score = (attr_matches / total_attrs) if total_attrs > 0 else 0.5

            # 3. Semantic text relevance score (0.0 to 1.0)
            desc_words = [w for w in analysis.description.lower().split() if len(w) > 3]
            semantic_matches = [w for w in desc_words if w in title_text]
            semantic_score = (len(semantic_matches) / len(desc_words)) if desc_words else 0.5

            # Combined weighted final score
            final_score = (0.4 * semantic_score) + (0.3 * attribute_score) + (0.3 * category_score)
            final_score = round(min(0.99, max(0.40, final_score)), 2)

            candidate.relevance_score = round(semantic_score, 2)
            candidate.attribute_score = round(attribute_score, 2)
            candidate.final_score = final_score
            candidate.match_reasons = list(dict.fromkeys(reasons)) or ["General product match"]

            ranked.append(candidate)

        # Sort descending by final_score
        ranked.sort(key=lambda x: x.final_score or 0.0, reverse=True)
        return ranked
