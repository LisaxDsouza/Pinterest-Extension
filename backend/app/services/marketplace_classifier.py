from typing import Dict, Any

MARKETPLACES: Dict[str, Dict[str, Any]] = {
    "amazon": {
        "name": "Amazon India",
        "domains": ["amazon.in", "amazon.com", "amzn.in", "amzn.to"]
    },
    "flipkart": {
        "name": "Flipkart",
        "domains": ["flipkart.com", "fkrt.it"]
    },
    "ikea": {
        "name": "IKEA",
        "domains": ["ikea.com", "ikea.in"]
    },
    "myntra": {
        "name": "Myntra",
        "domains": ["myntra.com"]
    },
    "pepperfry": {
        "name": "Pepperfry",
        "domains": ["pepperfry.com"]
    }
}


class MarketplaceClassifierService:

    def classify(self, domain: str, url: str = "") -> str:
        """
        Determines the marketplace key from domain and URL.
        Returns: 'amazon', 'flipkart', 'ikea', 'myntra', 'pepperfry', or 'other'.
        """
        clean_domain = domain.lower()
        if clean_domain.startswith("www."):
            clean_domain = clean_domain[4:]

        for mp_key, mp_data in MARKETPLACES.items():
            for d in mp_data["domains"]:
                if d in clean_domain or d in url.lower():
                    return mp_key

        return "other"
