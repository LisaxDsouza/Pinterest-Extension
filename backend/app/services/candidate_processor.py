from typing import List, Dict
from app.models.search import SearchResult
from app.models.product import ProductCandidate
from app.utils.url_utils import normalize_url
from app.services.marketplace_classifier import MarketplaceClassifierService


class CandidateProcessorService:

    def __init__(self, classifier: MarketplaceClassifierService = None):
        self.classifier = classifier or MarketplaceClassifierService()

    def process(
        self,
        search_results_map: Dict[str, List[SearchResult]]
    ) -> List[ProductCandidate]:
        """
        Deduplicates, normalizes URLs, and tags marketplace for search results.
        """
        seen_urls = set()
        candidates: List[ProductCandidate] = []

        for query_str, results in search_results_map.items():
            for sr in results:
                norm_url = normalize_url(sr.url)
                if not norm_url or norm_url in seen_urls:
                    continue

                seen_urls.add(norm_url)
                marketplace = self.classifier.classify(sr.domain, norm_url)

                candidates.append(
                    ProductCandidate(
                        title=sr.title,
                        url=norm_url,
                        domain=sr.domain,
                        marketplace=marketplace,
                        snippet=sr.snippet,
                        search_query=query_str
                    )
                )

        return candidates
