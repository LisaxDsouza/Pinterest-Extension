from fastapi.testclient import TestClient
from PIL import Image
import io
from unittest.mock import AsyncMock, patch

from app.main import app
from app.models.analysis import ProductAnalysis, ProductAttributes

client = TestClient(app)


def create_dummy_image():
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "providers" in data


@patch("app.api.routes_search.vision_analyzer.analyze")
def test_search_api_endpoint(mock_analyze):
    mock_analyze.return_value = ProductAnalysis(
        category="desk lamp",
        description="minimalist black desk lamp",
        attributes=ProductAttributes(color=["black"], material=["metal"]),
        search_terms=["black desk lamp"]
    )

    img_buf = create_dummy_image()
    res = client.post(
        "/api/search",
        files={"image": ("test.jpg", img_buf, "image/jpeg")}
    )
    assert res.status_code == 200
    data = res.json()
    assert "analysis" in data
    assert "queries" in data
    assert "products" in data
    assert "direct_searches" in data
    assert len(data["products"]) > 0
    assert len(data["direct_searches"]) > 0
    assert data["direct_searches"][0]["marketplace"] == "amazon"
