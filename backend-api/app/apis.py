from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Form, Response
from fastapi.staticfiles import StaticFiles
from typing import List, Tuple
from . import schemas, crud
from .model import Base
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
# import crud
import hashlib
import rasterio
from rasterio.warp import calculate_default_transform
from rasterio.transform import array_bounds
import subprocess
from .image_process import image_prediction, ImageStatus
import os
from .logging import LogPrefix, logging
import shutil
import time
import asyncio
import functools

Base.metadata.create_all(bind=engine)
IMAGEPATH = '/opt/images'
TILEPATH = '/opt/tiles'
TEMPPATH = '/tmp/upload'
PATHS = [IMAGEPATH, TILEPATH, TEMPPATH]

app = FastAPI(root_path='/api')
gdal_format = r'gdal2tiles.py {} {} --zoom=10-15 --xyz'
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
app.mount('/image', StaticFiles(directory='/opt/images'), name='image')
app.mount('/geojson', StaticFiles(directory='/opt/geojsons'), name='geojson')
app.mount('/mask', StaticFiles(directory='/opt/masks'), name='mask')

## xyz tiles
app.mount('/tiles', StaticFiles(directory='/opt/tiles'), name='tile')

# async def test_func():
#     global count
#     print('async task start')
#     await asyncio.sleep(2)
#     print('async task ended', flush=True)
#     count +=1

@app.get('/uploaded_chunks', response_model=List[int])
def return_uploaded_files_index():
    return [int(i) for i in os.listdir(TEMPPATH)]

# check whether the server is recieving or merging files...
@app.get('/r_u_busy', response_model=bool)
def am_i_busy():
    return len(os.listdir(TEMPPATH)) != 0

@app.post('/upload_chunk', status_code=201)
async def upload_chunk(index: int = Form(...), file: UploadFile = Form(...)):
    try:
        content = await file.read()
        with open(f'{TEMPPATH}/{index}', 'wb') as f:
            f.write(content)
    except IOError as e:
        logging(LogPrefix.ERROR, f'File write error index: {index}')
        raise HTTPException(status_code=406, detail=f'File write failed: {index}')
    except Exception as e:
        logging(LogPrefix.ERROR, f'Upload chunk error index: {index}')
        raise HTTPException(status_code=406, detail=f'Upload chunk failed: {index}')
    return Response(status_code=201)

# def file_write_callback(index: int, future: asyncio.Future[bytes]):
#     content = future.result()
#     with open(f'{TEMPPATH}/{index}', 'wb') as f:
#         f.write(content)

# @app.post('/upload_chunk_test', status_code=201)
# def upload_chunk_test(index: int = Form(...), file: UploadFile = Form(...)):
#     task = asyncio.create_task(file.read())
#     task.add_done_callback(functools.partial(file_write_callback, index))
#     loop = asyncio.get_event_loop()
#     loop.run_until_complete(task)

@app.get('/merge_files', status_code=200)
def merge_files(chunk_size: int):
    print('Merge Started', flush=True)
    files = return_uploaded_files_index()
    files.sort()
    n_files = len(files)
    if not (n_files == chunk_size):
        raise HTTPException(status_code=404, detail=f'Chunk size failed: {n_files}')
    merge = bytes()
    merge_time_start = time.time()
    for chunk in files:
        with open(f'{TEMPPATH}/{chunk}', 'rb') as c:
            cb = c.read()
            merge += cb
    merge_time_end = time.time()
    print(f'merge ended: {merge_time_end-merge_time_start} sec', flush=True)
    print('sha256 hasing start.', flush=True)
    hash_time_start = time.time()
    sha = hashlib.sha256(merge).hexdigest()
    hash_time_end = time.time()
    print(f'hashing ended: {hash_time_end-hash_time_start} sec', flush=True)
    print(f'hash: {sha}')
    print('image write start')
    image_time_start = time.time()
    with open(f'{IMAGEPATH}/{sha}.tif', 'wb') as image:
        image.write(merge)
    image_time_end = time.time()
    print(f'image write end: {image_time_end-image_time_start} sec', flush=True)

    print('Remove chunks', flush=True)
    rc_time_start = time.time()
    # remove chunk files.
    # for chunk in files:
    #     os.remove(f'{TEMPPATH}/{chunk}')
    clear_temp_files()
    rc_time_end = time.time()
    print(f'rc ended: {rc_time_end-rc_time_start} sec', flush=True)
    return Response(status_code=200)

async def merge_files_async(chunk_size: int) -> Tuple[str, int]:
    print('Merge Started', flush=True)
    files = return_uploaded_files_index()
    files.sort()
    n_files = len(files)
    if not (n_files == chunk_size):
        raise HTTPException(status_code=404, detail=f'Chunk size failed: {n_files}')
    merge = bytes()
    merge_time_start = time.time()
    for chunk in files:
        with open(f'{TEMPPATH}/{chunk}', 'rb') as c:
            cb = c.read()
            merge += cb
    merge_time_end = time.time()
    print(f'merge ended: {merge_time_end-merge_time_start} sec', flush=True)
    print('sha256 hasing start.', flush=True)
    hash_time_start = time.time()
    sha = hashlib.sha256(merge).hexdigest()
    hash_time_end = time.time()
    print(f'hashing ended: {hash_time_end-hash_time_start} sec', flush=True)
    print(f'hash: {sha}')
    print('image write start')
    image_time_start = time.time()
    with open(f'{IMAGEPATH}/{sha}.tif', 'wb') as image:
        image.write(merge)
    image_time_end = time.time()
    print(f'image write end: {image_time_end-image_time_start} sec', flush=True)

    print('Remove chunks', flush=True)
    rc_time_start = time.time()
    # remove chunk files.
    # for chunk in files:
    #     os.remove(f'{TEMPPATH}/{chunk}')
    clear_temp_files()
    rc_time_end = time.time()
    print(f'rc ended: {rc_time_end-rc_time_start} sec', flush=True)
    return sha, len(merge)

@app.get('/merge_files_caller', status_code=200)
async def merge_files_async_caller(title: str, chunk_size: int, db = Depends(get_db)):
    print('Async Merge Started', flush=True)
    task = asyncio.create_task(merge_files_async(chunk_size))
    def merge_callback(title: str, future: asyncio.Future[Tuple[str, int]]):
        sha, length = future.result()
        if sha != None:
            
            # Register in DB, inference to image model
            print(f'Not Implemented yet: {sha}', flush=True)

            with rasterio.open(f'{IMAGEPATH}/{sha}.tif') as image:
                transform = image.transform
                bounds = image.bounds
                width = image.width
                height = image.height
                print('이미지 좌표계: ', image.crs)
                transform, width, height = calculate_default_transform(
                    image.crs, DST_CRS, width, height, *bounds
                )
                bounds = array_bounds(height=height, width=width, transform=transform)
            image_bounds = schemas.ImageBounds(
                left=bounds[0],
                right=bounds[2],
                top=bounds[3],
                bottom=bounds[1]
            )
            x = (image_bounds.left + image_bounds.right) / 2
            y = (image_bounds.top + image_bounds.bottom) / 2
            info = schemas.SateImageInfo(
                title=title,
                size=length,
                sha256=sha,
                location=[x, y],
                resolution=[int(width), int(height)],
                bounds=image_bounds,
                status=ImageStatus.INIT.value
            )
            if crud.add_image(db, info) == None:
                print('this image already exists')
                
            crud.update_image_status(db, sha256=sha, status=ImageStatus.GENXYZ)
            results = subprocess.run(gdal_format.format(f'{IMAGEPATH}/{sha}.tif', f'{TILEPATH}/{sha}'),
                                     shell=True,
                                     stdout=subprocess.PIPE,
                                     stderr=subprocess.PIPE,
                                     text=True)
            print(results.stdout)
            print(results.stderr, flush=True)

            crud.update_image_status(db, sha256=sha, status=ImageStatus.DETECT)
            print(f'[APP/PREDICT]\tStart: {sha}')
            def task_done(sha, future: asyncio.Future[None]):
                print(f'[APP/PREDICT]\tTask done for {sha}', flush=True)
                crud.update_image_status(db, sha256=sha, status=ImageStatus.IDLE)
            # asyncio.run(image_prediction(task_done, sha))
            # await image_prediction(task_done, sha=sha)   # New Evaluation task
            print('end of merge callback', flush=True)

    task.add_done_callback(functools.partial(merge_callback, title))
    return Response(status_code=200)
    
@app.get('/imagelist', response_model=List[schemas.SateImageInfo])
def getImageList(db: Session = Depends(get_db)):
    db_list = crud.get_image_list(db)
    if db_list == None:
        return []
    result = []
    for i in db_list:
        result.append(schemas.SateImageInfo(
            title=i.title,
            size=i.size,
            sha256=i.sha256,
            location=[i.loc_hor, i.loc_ver],
            resolution=[i.res_ver, i.res_hor],
            bounds=schemas.ImageBounds(
                left=i.b_left,
                right=i.b_right,
                top=i.b_top,
                bottom=i.b_bottom
            ),
            status=i.status
        ))
    return result

DST_CRS = 'EPSG:4326'
# tif only
@app.post('/uploadimage', response_model=schemas.SateImageInfo)
async def upload_image(ext: str, file: UploadFile, db: Session = Depends(get_db)):
    content = await file.read()
    sha = hashlib.sha256(content).hexdigest()

    with open(f'{IMAGEPATH}/{sha}.{ext}', 'wb') as f:
        f.write(content)

    with rasterio.open(f'{IMAGEPATH}/{sha}.{ext}') as data:
        transform = data.transform
        bounds = data.bounds
        width = data.width
        height = data.height
        print('현재 좌표계: ', data.crs)
        print('width, height = ', width, height)
        print('bounds = ', data.bounds)
        transform, width, height = calculate_default_transform(data.crs, DST_CRS, width, height, *bounds)
        bounds = array_bounds(height=height, width=width, transform=transform)
        # bounds = (transformed_min_x, transformed_min_y, transformed_max_x, transformed_max_y)

    image_bounds = schemas.ImageBounds(
        left=bounds[0],
        right=bounds[2],
        top=bounds[3],
        bottom=bounds[1]
    )
    x = (image_bounds.left + image_bounds.right) / 2
    y = (image_bounds.top + image_bounds.bottom) / 2
    info = schemas.SateImageInfo(
        title=file.filename,
        size=len(content),
        sha256=sha,
        location=[x, y],
        resolution=[int(width), int(height)],
        bounds=image_bounds
    )
    if crud.add_image(db, info) == None:
        raise HTTPException(status_code=405, detail='Server has same image.')
    
    return info

@app.post('/uploadimage_test', response_model=schemas.SateImageInfo)
async def upload_image_test(ext: str, file: UploadFile, db: Session = Depends(get_db)):
    print('file reading...', flush=True)
    content = await file.read()
    print('file read ended', flush=True)
    sha = hashlib.sha256(content).hexdigest()
    print('file write start', flush=True)
    with open(f'{IMAGEPATH}/{sha}.{ext}', 'wb') as f:
        f.write(content)
    print('file write ended', flush=True)
    with rasterio.open(f'{IMAGEPATH}/{sha}.{ext}') as data:
        transform = data.transform
        bounds = data.bounds
        width = data.width
        height = data.height
        print('현재 좌표계: ', data.crs)
        print('width, height = ', width, height)
        print('bounds = ', data.bounds)
        transform, width, height = calculate_default_transform(data.crs, DST_CRS, width, height, *bounds)
        bounds = array_bounds(height=height, width=width, transform=transform)
        # bounds = (transformed_min_x, transformed_min_y, transformed_max_x, transformed_max_y)

    image_bounds = schemas.ImageBounds(
        left=bounds[0],
        right=bounds[2],
        top=bounds[3],
        bottom=bounds[1]
    )
    x = (image_bounds.left + image_bounds.right) / 2
    y = (image_bounds.top + image_bounds.bottom) / 2
    info = schemas.SateImageInfo(
        title=file.filename,
        size=len(content),
        sha256=sha,
        location=[x, y],
        resolution=[int(width), int(height)],
        bounds=image_bounds
    )
    if crud.add_image(db, info) == None:
        raise HTTPException(status_code=405, detail='Server has same image.')

    crud.update_image_status(db, sha256=sha, status=ImageStatus.GENXYZ)
    results = subprocess.run(gdal_format.format(f'{IMAGEPATH}/{sha}.{ext}', f'{TILEPATH}/{sha}'),
                             shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             text=True)
    print(results.stdout)
    print(results.stderr)
    # async 실행은 Popen.

    crud.update_image_status(db, sha256=sha, status=ImageStatus.DETECT)
    print(f'[APP/PREDICT]\tStart: {sha}')
    def task_done(sha, future: asyncio.Future[None]):
        print(f'[APP/PREDICT]\tTask done for {sha}', flush=True)
        crud.update_image_status(db, sha256=sha, status=ImageStatus.IDLE)
    await image_prediction(task_done, sha=sha)   # New Evaluation task

    return info

@app.get('/clear_temp_files', status_code=200)
def clear_temp_files():
    shutil.rmtree(TEMPPATH)
    os.makedirs(TEMPPATH, exist_ok=True)
# import asyncio
# def gen_arr():
#     return [1,2,3]
# async def test1(a):
#     await asyncio.sleep(3)
#     print(f'asdfasd: {a}', flush=True)

# @app.get('/test_func', response_model=str)
# async def testing_function(aa=gen_arr()):
#     print('test start')
#     asyncio.create_task(test1(aa))
#     print('test end')
#     return 'main progress end'

import random
@app.get('/addimageinfo', response_model=schemas.SateImageInfo)
def add_image_info(title:str, db: Session=Depends(get_db)):
    size = random.randint(0, 1234)
    sha256 = hashlib.sha256(title.encode('utf-8')).hexdigest()
    return crud.add_image(db, schemas.SateImageInfo(
        title=title,
        size=size,
        sha256=sha256,
        location=[random.random()*90, random.random()*180],
        resolution=[1280, 1280],
        bounds=schemas.create_bounds([1,1,1,1])
    ))
