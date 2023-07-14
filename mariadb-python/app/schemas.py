from typing import List
from pydantic import BaseModel

class ImageBounds(BaseModel):
    left: float
    right: float
    top: float
    bottom: float

class SateImageInfo(BaseModel):
    title: str  # file name
    size: int   # file size
    sha256: str    # file checksums
    location: List[float]   # [lat, lon]
    resolution: List[int]   # [vertical, horizontal]
    bounds: ImageBounds
