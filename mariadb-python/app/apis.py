from fastapi import FastAPI, Depends, UploadFile, File
from typing import List
from . import schemas, crud
from .model import Base
from .database import SessionLocal, engine
from sqlalchemy.orm import Session
# import crud
import hashlib
import rasterio

Base.metadata.create_all(bind=engine)
IMAGEPATH = '/opt/images'
app = FastAPI(root_path='/api')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get('/imagelist', response_model=List[schemas.SateImageInfo])
def getImageList(db: Session = Depends(get_db)):
    db_list = crud.get_image_list()
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

    image_bounds = schemas.ImageBounds(
        left=bounds.left,
        right=bounds.right,
        top=bounds.top,
        bottom=bounds.bottom
    )
    x = (bounds.left + bounds.right) / 2
    y = (bounds.top + bounds.bottom) / 2
    info = schemas.SateImageInfo(
        title=file.filename,
        size=len(content),
        sha256=sha,
        location=[x, y],
        resolution=[int(width), int(height)],
        bounds=image_bounds
    )
    crud.add_image(db, info)
    return info
