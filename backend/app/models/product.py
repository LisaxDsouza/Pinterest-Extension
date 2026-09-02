from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.analysis import ProductAnalysis


class ProductCandidate(BaseModel):
    title: str = Field(..., description="Product candidate title from web search")
    url: str = Field(..., description="Normalized product candidate URL")
    domain: str = Field(..., description="Normalized domain name (e.g. amazon.in)")
    marketplace: str = Field(..., description="Classified marketplace tag (e.g. amazon, flipkart, ikea, other)")
    snippet: Optional[str] = Field(default=None, description="Search result snippet text")
    search_query: str = Field(..., description="Query used to discover this candidate")
    relevance_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Semantic text relevance score")
    visual_similarity_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Visual similarity score")
    attribute_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Attribute overlap score")
    final_score: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Final combined ranking score")
    match_reasons: List[str] = Field(default_factory=list, description="List of match explanations")


class DirectSearchLink(BaseModel):
    marketplace: str = Field(..., description="Target marketplace (e.g. amazon, flipkart, ikea)")
    query: str = Field(..., description="Search query string")
    url: str = Field(..., description="Direct search landing page URL")


class SearchResponse(BaseModel):
    analysis: ProductAnalysis
    queries: List[str]
    products: List[ProductCandidate]
    direct_searches: List[DirectSearchLink]
