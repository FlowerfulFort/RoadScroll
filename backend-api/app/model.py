from .database import Base
from sqlalchemy import Column, String, Integer, Float, BigInteger
from sqlalchemy.dialects.mysql import DECIMAL, DOUBLE

class SateImage(Base):
    __tablename__ = 'roadimage'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(length=128), unique=True, index=True)
    size = Column(BigInteger)
    sha256 = Column(String(length=64), unique=True)

    status = Column(String(length=30))

    loc_ver = Column(DECIMAL(precision=32, scale=16))
    loc_hor = Column(DECIMAL(precision=32, scale=16))
    # loc_ver = Column(DOUBLE)
    # loc_hor = Column(DOUBLE)
    
    res_ver = Column(Integer)
    res_hor = Column(Integer)
    
    b_left = Column(DECIMAL(precision=32, scale=16))
    b_right = Column(DECIMAL(precision=32, scale=16))
    b_top = Column(DECIMAL(precision=32, scale=16))
    b_bottom = Column(DECIMAL(precision=32, scale=16))

    # b_left = Column(DOUBLE)
    # b_right = Column(DOUBLE)
    # b_top = Column(DOUBLE)
    # b_bottom = Column(DOUBLE)

