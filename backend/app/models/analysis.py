from typing import List
from pydantic import BaseModel, Field


class ProductAttributes(BaseModel):
    color: List[str] = Field(default_factory=list, description="Colors of the object")
    material: List[str] = Field(default_factory=list, description="Materials used")
    style: List[str] = Field(default_factory=list, description="Design style (e.g. minimalist, modern)")
    shape: List[str] = Field(default_factory=list, description="Shape characteristics")
    finish: List[str] = Field(default_factory=list, description="Finish characteristics (e.g. matte, glossy)")
    usage: List[str] = Field(default_factory=list, description="Primary use cases or placement")


class ProductAnalysis(BaseModel):
    category: str = Field(..., description="Main product category (e.g. desk lamp, ergonomic chair)")
    description: str = Field(..., description="Detailed description of the visual product")
    attributes: ProductAttributes = Field(default_factory=ProductAttributes)
    search_terms: List[str] = Field(default_factory=list, description="Generated search queries for web search")
