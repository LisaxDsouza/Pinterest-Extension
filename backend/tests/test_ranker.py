from app.models.analysis import ProductAnalysis, ProductAttributes
from app.models.product import ProductCandidate
from app.services.product_ranker import ProductRankerService


def test_product_ranking():
    analysis = ProductAnalysis(
        category="desk lamp",
        description="minimalist black metal desk lamp",
        attributes=ProductAttributes(color=["black"], material=["metal"], style=["minimalist"]),
        search_terms=["black desk lamp"]
    )

    candidates = [
        ProductCandidate(
            title="Black Ceiling Light Fixture",
            url="https://www.example.com/ceiling-light",
            domain="example.com",
            marketplace="other",
            search_query="black lamp"
        ),
        ProductCandidate(
            title="Modern Black Metal Desk Lamp for Study",
            url="https://www.amazon.in/dp/B08X12345",
            domain="amazon.in",
            marketplace="amazon",
            search_query="black desk lamp"
        )
    ]

    ranker = ProductRankerService()
    ranked = ranker.rank(analysis, candidates)

    assert len(ranked) == 2
    # Desk lamp must rank above ceiling light
    assert ranked[0].title == "Modern Black Metal Desk Lamp for Study"
    assert ranked[0].final_score > ranked[1].final_score
