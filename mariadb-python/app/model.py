from .database import Base
from sqlalchemy import Column, String, Integer, Float

class SateImage(Base):
    __tablename__ = 'roadimage'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(length=128), unique=True, index=True)
    size = Column(Integer)
    sha256 = Column(String(length=64))
    loc_ver = Column(Float)
    loc_hor = Column(Float)
    res_ver = Column(Integer)
    res_hor = Column(Integer)
    b_left = Column(Float)
    b_right = Column(Float)
    b_top = Column(Float)
    b_bottom = Column(Float)
