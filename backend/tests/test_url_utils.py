from app.utils.url_utils import normalize_url


def test_amazon_url_normalization():
    raw_url = "https://www.amazon.in/Modern-Black-Desk-Lamp/dp/B08X12345?ref=sr_1_1&qid=1600000"
    normalized = normalize_url(raw_url)
    assert normalized == "https://www.amazon.in/dp/B08X12345"


def test_flipkart_url_normalization():
    raw_url = "https://www.flipkart.com/minimalist-metal-table-lamp/p/itm123456789?pid=123&utm_source=google"
    normalized = normalize_url(raw_url)
    assert normalized == "https://www.flipkart.com/p/itm123456789"


def test_general_url_tracking_param_stripping():
    raw_url = "https://www.ikea.com/in/en/p/forsa-work-lamp-black-80416281/?utm_medium=cpc&ref=search"
    normalized = normalize_url(raw_url)
    assert "utm_medium" not in normalized
    assert "ref=" not in normalized
