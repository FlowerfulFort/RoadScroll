from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .image_process import ImageStatus
# from .model import SateImage
from . import schemas, model

def get_image_list(db: Session):
    return db.query(model.SateImage).all()

def add_image(db: Session, new: schemas.SateImageInfo):
    db_image = model.SateImage(
        title = new.title,
        size = new.size,
        sha256 = new.sha256,
        status = ImageStatus.INIT.value,
        loc_ver = new.location[0],
        loc_hor = new.location[1],
        res_ver = new.resolution[0],
        res_hor = new.resolution[1],
        b_left = new.bounds.left,
        b_right = new.bounds.right,
        b_top = new.bounds.top,
        b_bottom = new.bounds.bottom,
    )
    try:
        db.add(db_image)
    except IntegrityError as e:
        return None
    db.commit()
    db.refresh(db_image)

    return new

def get_image_by_hash(db: Session, sha256: str):
    return db.query(model.SateImage).filter(model.SateImage.sha256 == sha256).first()

def update_image_status(db: Session, sha256: str, status: ImageStatus):
    db.query(model.SateImage).filter(model.SateImage.sha256 == sha256).update({"status": status.value})
    db.commit()

    data = get_image_by_hash(db, sha256)
    db.refresh(data)
    return data
