from typing import Optional
from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    query: str = Field(..., description="Target search query string")
    reason: Optional[str] = Field(default=None, description="Explanation of why this query was generated")


class SearchResult(BaseModel):
    title: str = Field(..., description="Web search result title")
    url: str = Field(..., description="Target result URL")
    snippet: Optional[str] = Field(default=None, description="Search result snippet/description text")
    domain: str = Field(..., description="Normalized domain name (e.g. amazon.in, flipkart.com)")
    position: Optional[int] = Field(default=None, description="Rank position in search engine result page")
