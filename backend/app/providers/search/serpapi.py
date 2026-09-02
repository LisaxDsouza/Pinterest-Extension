import logging
import urllib.parse
import httpx
from typing import List
from fastapi import HTTPException, status
from app.models.search import SearchResult
from app.providers.search.base import SearchProvider
from app.config import settings

logger = logging.getLogger(__name__)


class SerpApiSearchProvider(SearchProvider):

    async def search(
        self,
        query: str,
        num_results: int = 10
    ) -> List[SearchResult]:
        if not settings.SERPAPI_API_KEY or not settings.SERPAPI_API_KEY.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SERPAPI_API_KEY is missing in backend/.env. Please add your SerpAPI key."
            )

        url = "https://serpapi.com/search.json"
        params = {
            "q": query,
            "engine": "google",
            "gl": "in",
            "hl": "en",
            "num": num_results,
            "api_key": settings.SERPAPI_API_KEY.strip()
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, params=params)
            if res.status_code == 200:
                data = res.json()
                organic = data.get("organic_results", [])
                results: List[SearchResult] = []

                for idx, item in enumerate(organic):
                    raw_url = item.get("link", "")
                    parsed_domain = urllib.parse.urlparse(raw_url).netloc.lower()
                    if parsed_domain.startswith("www."):
                        parsed_domain = parsed_domain[4:]

                    results.append(
                        SearchResult(
                            title=item.get("title", ""),
                            url=raw_url,
                            snippet=item.get("snippet"),
                            domain=parsed_domain,
                            position=idx + 1
                        )
                    )
                return results
            else:
                logger.error(f"SerpAPI Error: {res.status_code} {res.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"SerpAPI Error ({res.status_code}): {res.text}"
                )
