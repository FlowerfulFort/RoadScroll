import asyncio
import functools
from enum import Enum, unique
import subprocess

IMAGEPATH = '/opt/images'

def get_path(sha, ext='tif'):
    return f'{IMAGEPATH}/{sha}/image.{ext}'

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

FORMAT = r'python app/RoadToGraduate/large_predict.py {}'

async def call_prediction(sha):
    # print('call prediction, sleep 5 secs for testing...', flush=True)
    # await asyncio.sleep(5)
    # print(sha, flush=True)
    # return True
    print('before eval', flush=True)
    result = subprocess.run(FORMAT.format(get_path(sha)),
                   shell=True,
                   stdout=subprocess.PIPE,
                   stderr=subprocess.PIPE,
                   text=True)
    print('eval completed', flush=True)
    result2 = subprocess.run(r'python app/RoadToGraduate/large_predict_next.py {}'.format(get_path(sha)),
                             shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             text=True)
    print('------------------------result 1-------------------------')
    print(f'stdout: {result.stdout}')
    print(f'stderr: {result.stderr}', flush=True)
    print('------------------------reslut 2-------------------------')
    print(f'stdout: {result2.stdout}')
    print(f'stderr: {result2.stderr}', flush=True)
    print('after eval', flush=True)
    return True

if __name__ == '__main__':
    def callback(sha):
        print(f'asdf: {sha}')
    asyncio.run(image_prediction(callback, r'6f09b73f9e875d596d7147ccff5a6a2edf6693b8d946d1053f608b9e07d0dbe6'))
