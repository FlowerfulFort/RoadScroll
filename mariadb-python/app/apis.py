from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from typing import List
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

Base.metadata.create_all(bind=engine)
IMAGEPATH = '/opt/images'
TILEPATH = '/opt/tiles'
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
app.mount('/masks', StaticFiles(directory='/opt/masks'), name='mask')

## xyz tiles
app.mount('/tiles', StaticFiles(directory='/opt/tiles'), name='tile')

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
            location=[i.loc_ver, i.loc_hor],
            resolution=[i.res_ver, i.res_hor],
            bounds=schemas.ImageBounds(
                left=i.b_left,
                right=i.b_right,
                top=i.b_top,
                bottom=i.b_bottom
            )
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

    results = subprocess.run(gdal_format.format(f'{IMAGEPATH}/{sha}.{ext}', f'{TILEPATH}/{sha}'),
                             shell=True,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             text=True)
    print(results.stdout)
    # async 실행은 Popen.

    return info


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
