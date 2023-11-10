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
    status: str

def create_bounds(arr: List[int]) -> ImageBounds:
    assert len(arr) == 4, 'Array size error: it must have 4 elements'
    return ImageBounds(
        left=arr[0],
        right=arr[1],
        top=arr[2],
        bottom=arr[3]
    )