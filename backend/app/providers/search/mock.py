from typing import List
import urllib.parse
import re
from app.models.search import SearchResult
from app.providers.search.base import SearchProvider


class MockSearchProvider(SearchProvider):

    async def search(
        self,
        query: str,
        num_results: int = 10
    ) -> List[SearchResult]:
        """
        Mock search provider returning dynamic, query-matched candidate web results across marketplaces.
        """
        q_title = query.title()
        q_encoded = urllib.parse.quote_plus(query)

        # Generate realistic, query-matched candidate items
        results = [
            SearchResult(
                title=f"{q_title} - High Quality Online at Best Price",
                url=f"https://www.amazon.in/dp/B08X{abs(hash(query)) % 89999 + 10000}?ref=search_mock",
                snippet=f"Buy {q_title} online at best price in India on Amazon.in. Top rated, highly durable, perfect for home, study & office decor.",
                domain="amazon.in",
                position=1
            ),
            SearchResult(
                title=f"Modern {q_title} (Matte Finish)",
                url=f"https://www.flipkart.com/p/itm{abs(hash(query)) % 89999999 + 10000000}",
                snippet=f"Shop Modern {q_title} on Flipkart. Free Shipping, Cash on Delivery & Easy Returns across India.",
                domain="flipkart.com",
                position=2
            ),
            SearchResult(
                title=f"Minimalist {q_title} Collection - IKEA India",
                url=f"https://www.ikea.com/in/en/p/forsa-{q_encoded.lower()}-80416281/",
                snippet=f"Explore IKEA {q_title}. Classic steel construction with adjustable design for home & office placement.",
                domain="ikea.com",
                position=3
            ),
            SearchResult(
                title=f"Aesthetic Room Decor & {q_title} - Pepperfry",
                url=f"https://www.pepperfry.com/site-search.html?q={q_encoded}",
                snippet=f"Explore wide range of {q_title} on Pepperfry. Best deals, free delivery & premium quality guaranteed.",
                domain="pepperfry.com",
                position=4
            ),
            SearchResult(
                title=f"Premium Heavy Duty {q_title}",
                url=f"https://www.amazon.in/dp/B07Z{abs(hash(query + '2')) % 89999 + 10000}",
                snippet=f"Amazon.in: Buy Premium Heavy Duty {q_title}. Guaranteed quality, fast shipping, and top customer ratings.",
                domain="amazon.in",
                position=5
            )
        ]

        return results[:num_results]
