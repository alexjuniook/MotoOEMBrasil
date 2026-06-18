from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column,Integer,String,ForeignKey

class Base(DeclarativeBase): pass
class Brand(Base): __tablename__='brands'; id=Column(Integer,primary_key=True); name=Column(String)
class Model(Base): __tablename__='models'; id=Column(Integer,primary_key=True); name=Column(String)
class Motorcycle(Base): __tablename__='motorcycles'; id=Column(Integer,primary_key=True); model_id=Column(Integer,ForeignKey('models.id'))
class Part(Base): __tablename__='parts'; id=Column(Integer,primary_key=True); oem_code=Column(String)
class Compatibility(Base): __tablename__='compatibilities'; id=Column(Integer,primary_key=True)
class EquivalentPart(Base): __tablename__='equivalent_parts'; id=Column(Integer,primary_key=True)
