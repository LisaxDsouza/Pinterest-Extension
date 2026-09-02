from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)


def preprocess_image(image_bytes: bytes, max_dim: int = 512, quality: int = 80) -> bytes:
    """
    Downscales cropped image bytes to a maximum dimension (default 512px)
    maintaining aspect ratio and encodes to compressed JPEG at 80% quality.
    Reduces byte payload size by ~90-95% for hyper-fast LLM vision inference.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size

        if max(w, h) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        compressed_bytes = buffer.getvalue()

        logger.info(f"Image preprocessed: Original={len(image_bytes)} bytes ({w}x{h}) -> Compressed={len(compressed_bytes)} bytes ({img.width}x{img.height})")
        return compressed_bytes
    except Exception as e:
        logger.warning(f"Image preprocessing failed ({e}), returning original bytes.")
        return image_bytes
