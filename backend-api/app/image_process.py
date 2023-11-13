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

async def call_prediction(sha):
    print('call prediction, sleep 5 secs for testing...', flush=True)
    await asyncio.sleep(5)
    print(sha, flush=True)
    return True
