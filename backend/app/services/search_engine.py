import asyncio
import logging
from typing import List, Dict
from app.models.search import SearchQuery, SearchResult
from app.providers.search.base import SearchProvider
from app.providers.search.mock import MockSearchProvider
from app.providers.search.brave import BraveSearchProvider
from app.providers.search.serpapi import SerpApiSearchProvider
from app.config import settings

logger = logging.getLogger(__name__)


def get_search_provider() -> SearchProvider:
    provider_type = settings.SEARCH_PROVIDER.lower()
    if provider_type == "brave":
        return BraveSearchProvider()
    elif provider_type == "serpapi":
        return SerpApiSearchProvider()
    return MockSearchProvider()


class SearchEngineService:

    def __init__(self, provider: SearchProvider = None):
        self.provider = provider or get_search_provider()

    async def execute_searches(
        self,
        queries: List[SearchQuery],
        max_results_per_query: int = None
    ) -> Dict[str, List[SearchResult]]:
        """
        Executes web searches asynchronously for a list of SearchQuery objects.
        Returns a dict mapping query string to list of SearchResult items.
        """
        num_results = max_results_per_query or settings.MAX_RESULTS_PER_QUERY
        results_map: Dict[str, List[SearchResult]] = {}

        tasks = [self.provider.search(sq.query, num_results=num_results) for sq in queries]
        responses = await asyncio.gather(*tasks, return_exceptions=False)

        for sq, res in zip(queries, responses):
            results_map[sq.query] = res

        return results_map
