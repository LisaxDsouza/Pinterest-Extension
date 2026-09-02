import re
import urllib.parse


def normalize_url(url: str) -> str:
    """
    Normalizes product URLs across marketplaces by stripping tracking parameters,
    session tokens, and extracting canonical product paths (e.g. Amazon ASINs).
    """
    if not url:
        return ""

    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]

        path = parsed.path

        # 1. Amazon canonical URL normalization (/dp/ASIN or /gp/product/ASIN or /.../dp/ASIN)
        if "amazon" in domain:
            asin_match = re.search(r'/(?:dp|gp/product)/([a-zA-Z0-9]{9,12})', path, re.IGNORECASE)
            if asin_match:
                asin = asin_match.group(1).upper()
                return f"https://www.{domain}/dp/{asin}"

        # 2. Flipkart canonical URL normalization (/p/ITM...)
        if "flipkart" in domain:
            itm_match = re.search(r'/(p/itm[a-zA-Z0-9]+)', path, re.IGNORECASE)
            if itm_match:
                return f"https://www.{domain}/{itm_match.group(1)}"

        # 3. Strip tracking & session query parameters for general URLs
        query_params = urllib.parse.parse_qs(parsed.query, keep_blank_values=False)
        tracking_keys = {
            "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
            "ref", "tag", "qid", "sr", "keywords", "pf_rd_r", "pf_rd_p", "pd_rd_r",
            "gclid", "fbclid", "_encoding", "crid", "sprefix"
        }

        clean_params = {k: v for k, v in query_params.items() if k.lower() not in tracking_keys}
        clean_query = urllib.parse.urlencode(clean_params, doseq=True)

        clean_path = path.rstrip("/") if path != "/" else ""

        full_domain = f"www.{domain}" if not domain.startswith("www.") else domain

        if clean_query:
            return f"https://{full_domain}{clean_path}?{clean_query}"
        else:
            return f"https://{full_domain}{clean_path}"
    except Exception:
        return url
