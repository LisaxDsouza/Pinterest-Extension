from app.models.analysis import ProductAnalysis, ProductAttributes
from app.models.search import SearchQuery, SearchResult
from app.models.product import ProductCandidate, SearchResponse


def test_product_analysis_model():
    analysis = ProductAnalysis(
        category="desk lamp",
        description="black metal lamp",
        attributes=ProductAttributes(color=["black"], material=["metal"]),
        search_terms=["black desk lamp"]
    )
    assert analysis.category == "desk lamp"
    assert "black" in analysis.attributes.color


def test_product_candidate_model():
    candidate = ProductCandidate(
        title="Modern Black Desk Lamp",
        url="https://www.amazon.in/dp/B08X12345",
        domain="amazon.in",
        marketplace="amazon",
        snippet="Buy online at best price",
        search_query="black desk lamp",
        final_score=0.94
    )
    assert candidate.marketplace == "amazon"
    assert candidate.final_score == 0.94
