from sqlalchemy.orm import Session
from .model import SateImage
from . import schemas

def get_image_list(db: Session):
    return db.query(SateImage).all()

def add_image(db: Session, new: schemas.SateImageInfo):
    db_image = SateImage(
        title = new.title,
        size = new.size,
        sha256 = new.sha256,
        loc_ver = new.location[0],
        loc_hor = new.location[1],
        res_ver = new.resolution[0],
        res_hor = new.resolution[1]
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image

def get_image_by_hash(db: Session, sha256: str):
    return db.query(SateImage).filter(SateImage.sha256 == sha256).first()
