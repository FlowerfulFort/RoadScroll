import asyncio
import functools
from enum import Enum, unique

@unique
class ImageStatus(Enum):    # string only
    INIT:   str = 'Initializing'
    GENXYZ: str = 'Generating XYZ'
    DETECT: str = 'Detecting Roads'
    IDLE:   str = 'Idle'
    ERROR:  str = 'Error'

async def image_prediction(callback, sha):
    task = asyncio.create_task(call_prediction(sha))
    task.add_done_callback(functools.partial(callback, sha))

async def call_prediction(sha, future: asyncio.Future[None]):
    print(sha, flush=True)
    return True
