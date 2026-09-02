from abc import ABC, abstractmethod
from typing import List
from app.models.search import SearchResult


class SearchProvider(ABC):

    @abstractmethod
    async def search(
        self,
        query: str,
        num_results: int = 10
    ) -> List[SearchResult]:
        """
        Executes web search for query and returns normalized list[SearchResult].
        """
        pass
