from app.services.marketplace_classifier import MarketplaceClassifierService


def test_marketplace_classification():
    classifier = MarketplaceClassifierService()

    assert classifier.classify("amazon.in") == "amazon"
    assert classifier.classify("www.flipkart.com") == "flipkart"
    assert classifier.classify("ikea.com") == "ikea"
    assert classifier.classify("myntra.com") == "myntra"
    assert classifier.classify("pepperfry.com") == "pepperfry"
    assert classifier.classify("example.com") == "other"
