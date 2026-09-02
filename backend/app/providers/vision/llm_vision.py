import json
import logging
import base64
import httpx
from fastapi import HTTPException, status
from google import genai
from google.genai import types

from app.models.analysis import ProductAnalysis, ProductAttributes
from app.providers.vision.base import BaseVisionProvider
from app.utils.image_processor import preprocess_image
from app.config import settings

logger = logging.getLogger(__name__)


class LLMVisionProvider(BaseVisionProvider):

    def __init__(self, provider_name: str = "gemini"):
        self.provider_name = provider_name.lower()

    async def analyze_image(self, image_bytes: bytes) -> ProductAnalysis:
        if self.provider_name == "gemini":
            key = (settings.GEMINI_API_KEY or "").strip()
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GEMINI_API_KEY is missing in backend/.env. Please get your free key from https://aistudio.google.com/."
                )
            return await self._analyze_gemini(image_bytes)

        elif self.provider_name == "openai":
            key = (settings.OPENAI_API_KEY or "").strip()
            if not key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="OPENAI_API_KEY is missing in backend/.env. Please add your OpenAI key."
                )
            return await self._analyze_openai(image_bytes)

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported vision provider '{self.provider_name}'. Set VISION_PROVIDER=gemini or openai in .env."
            )

    async def _analyze_gemini(self, image_bytes: bytes) -> ProductAnalysis:
        key = settings.GEMINI_API_KEY.strip()

        # Step 1: Preprocess and compress image (downscale to max 512px at 80% JPEG quality)
        compressed_bytes = preprocess_image(image_bytes, max_dim=512, quality=80)

        prompt = (
            "You are an expert shopping visual assistant. Analyze this cropped product image.\n"
            "Identify the exact item category, visual description, attributes, and 3-5 distinct shopping search queries for e-commerce marketplaces.\n"
            "Respond ONLY with a valid JSON object matching this exact schema without markdown:\n"
            "{\n"
            '  "category": "exact product category (e.g. magnetic whiteboard calendar, ergonomic desk chair)",\n'
            '  "description": "visual description including color, material, style, shape",\n'
            '  "attributes": {\n'
            '    "color": ["dominant colors"],\n'
            '    "material": ["materials used"],\n'
            '    "style": ["design styles"],\n'
            '    "shape": ["shape attributes"],\n'
            '    "finish": ["finish type"],\n'
            '    "usage": ["primary placement or use"]\n'
            '  },\n'
            '  "search_terms": ["3-5 targeted shopping search queries for marketplaces like Amazon, Flipkart, IKEA"]\n'
            "}"
        )

        try:
            client = genai.Client(api_key=key)
            # Step 2: Disable Automatic Function Calling (AFC) warning explicitly
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
            )

            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=[
                    types.Part.from_bytes(data=compressed_bytes, mime_type="image/jpeg"),
                    prompt
                ],
                config=config
            )

            text = (response.text or "").strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:].strip()

            parsed = json.loads(text)
            return ProductAnalysis(**parsed)

        except Exception as err:
            logger.error(f"Gemini 3.6 Flash error: {err}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Gemini Vision API error: {str(err)}"
            )

    async def _analyze_openai(self, image_bytes: bytes) -> ProductAnalysis:
        compressed_bytes = preprocess_image(image_bytes, max_dim=512, quality=80)
        url = "https://api.openai.com/v1/chat/completions"
        b64_img = base64.b64encode(compressed_bytes).decode("utf-8")
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY.strip()}",
            "Content-Type": "application/json"
        }
        prompt = (
            "Analyze this cropped product image. Return JSON strictly matching this schema:\n"
            '{"category": "...", "description": "...", "attributes": {"color": [], "material": [], "style": [], "shape": [], "finish": [], "usage": []}, "search_terms": []}'
        )

        payload = {
            "model": "gpt-4o-mini",
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
                    ]
                }
            ],
            "max_tokens": 500
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return ProductAnalysis(**parsed)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"OpenAI API Error ({res.status_code}): {res.text}"
                    )
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="OpenAI API connection timed out.")
