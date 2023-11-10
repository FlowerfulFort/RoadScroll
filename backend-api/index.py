import uvicorn
from app.database import engine
from app import apis
from sqlalchemy.exc import OperationalError
import time
import os

def wait_for_mariadb(engine, max_retries=10, retry_interval=5):
    retries = 0
    while retries < max_retries:
        try:
            # 연결 시도
            engine.connect()
            print("MariaDB connection successful")
            return True
        except OperationalError as e:
            print(f"MariaDB connection failed: {str(e)}. Retrying in {retry_interval} seconds...")
            retries += 1
            time.sleep(retry_interval)
    print("Failed to connect to MariaDB")
    return False

if __name__ == '__main__':
    wait_for_mariadb(engine=engine)
    engine.dispose()

    for p in apis.PATHS:
        os.makedirs(p, exist_ok=True)

    uvicorn.run("app.apis:app", port=8000, host='0.0.0.0', root_path='/api', workers=4)
