import urllib.parse
from typing import List
from app.models.product import DirectSearchLink


class DirectSearchService:

    def generate_direct_searches(self, queries: List[str]) -> List[DirectSearchLink]:
        """
        Generates direct landing page search URLs for marketplaces.
        """
        if not queries:
            return []

        primary_query = queries[0]
        encoded = urllib.parse.quote_plus(primary_query)

        links = [
            DirectSearchLink(
                marketplace="amazon",
                query=primary_query,
                url=f"https://www.amazon.in/s?k={encoded}"
            ),
            DirectSearchLink(
                marketplace="flipkart",
                query=primary_query,
                url=f"https://www.flipkart.com/search?q={encoded}"
            ),
            DirectSearchLink(
                marketplace="ikea",
                query=primary_query,
                url=f"https://www.ikea.com/in/en/search/?q={encoded}"
            )
        ]

        return links
