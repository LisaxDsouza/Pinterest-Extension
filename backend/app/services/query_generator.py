from typing import List
from app.models.analysis import ProductAnalysis
from app.models.search import SearchQuery
from app.config import settings


class QueryGeneratorService:

    def generate_queries(
        self,
        analysis: ProductAnalysis,
        max_queries: int = None
    ) -> List[SearchQuery]:
        limit = max_queries or settings.MAX_QUERIES
        queries: List[SearchQuery] = []
        seen_strings = set()

        category = analysis.category.strip()
        colors = analysis.attributes.color
        materials = analysis.attributes.material
        styles = analysis.attributes.style
        finishes = analysis.attributes.finish
        usages = analysis.attributes.usage

        # Query 1: Primary category + color + style
        color_str = colors[0] if colors else ""
        style_str = styles[0] if styles else ""
        q1_parts = [p for p in [color_str, style_str, category] if p]
        q1 = " ".join(q1_parts)
        if q1 and q1.lower() not in seen_strings:
            seen_strings.add(q1.lower())
            queries.append(SearchQuery(query=q1, reason="category + color + style"))

        # Query 2: Material + finish + usage + category
        mat_str = materials[0] if materials else ""
        finish_str = finishes[0] if finishes else ""
        usage_str = usages[0] if usages else ""
        q2_parts = [p for p in [finish_str, mat_str, usage_str, category] if p]
        q2 = " ".join(q2_parts)
        if q2 and q2.lower() not in seen_strings:
            seen_strings.add(q2.lower())
            queries.append(SearchQuery(query=q2, reason="material + finish + usage"))

        # Query 3: Existing AI search_terms if available
        for term in analysis.search_terms:
            if term.lower() not in seen_strings and len(queries) < limit:
                seen_strings.add(term.lower())
                queries.append(SearchQuery(query=term, reason="AI visual search term"))

        # Query 4: Simple category fallback
        if len(queries) < limit and category.lower() not in seen_strings:
            queries.append(SearchQuery(query=category, reason="base product category"))

        return queries[:limit]
