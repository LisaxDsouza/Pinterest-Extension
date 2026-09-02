import logging
import urllib.parse
import httpx
from typing import List
from fastapi import HTTPException, status
from app.models.search import SearchResult
from app.providers.search.base import SearchProvider
from app.config import settings

logger = logging.getLogger(__name__)


class BraveSearchProvider(SearchProvider):

    async def search(
        self,
        query: str,
        num_results: int = 10
    ) -> List[SearchResult]:
        if not settings.BRAVE_API_KEY or not settings.BRAVE_API_KEY.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="BRAVE_API_KEY is missing in backend/.env. Please add your Brave API key."
            )

        url = "https://api.search.brave.com/res/v1/web/search"
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": settings.BRAVE_API_KEY.strip()
        }
        params = {
            "q": query,
            "count": num_results
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url, headers=headers, params=params)
            if res.status_code == 200:
                data = res.json()
                web_results = data.get("web", {}).get("results", [])
                results: List[SearchResult] = []

                for idx, item in enumerate(web_results):
                    raw_url = item.get("url", "")
                    parsed_domain = urllib.parse.urlparse(raw_url).netloc.lower()
                    if parsed_domain.startswith("www."):
                        parsed_domain = parsed_domain[4:]

                    results.append(
                        SearchResult(
                            title=item.get("title", ""),
                            url=raw_url,
                            snippet=item.get("description"),
                            domain=parsed_domain,
                            position=idx + 1
                        )
                    )
                return results
            else:
                logger.error(f"Brave Search API error: {res.status_code} {res.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Brave Search API Error ({res.status_code}): {res.text}"
                )
