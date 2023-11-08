import os
import time
from enum import Enum

LOGPATH = '/log/app'

class LogPrefix(Enum):
    ERROR = 'ERROR'


def logging(type: LogPrefix, message: str):
    os.makedirs(LOGPATH, exist_ok=True)
    with open(f'{LOGPATH}/log.txt', 'a') as f:
        f.write(message)
        f.write('\n')
