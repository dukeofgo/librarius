from datetime import date
from pydantic import BaseModel
from fastapi import UploadFile

"""class inherits from BookBase will also inherit the Config"""
class BookBase(BaseModel):
    title: str
    author: str | None
    isbn: str 

    class Config:
        orm_mode = True

class BookInfo(BaseModel):
    edition: str | None = None
    publisher: str | None = None
    publish_date: str | None = None 
    publish_place: str | None = None
    number_of_pages: int | None = None 
    description: str | None = None
    language: str | None = None 
    lccn: str | None = None 
    subtitle: str | None = None 
    subjects: str | None = None
    cover_image: bytes | None = None

class BookMetadata(BaseModel):
    id: int | None = None
    added_date: date | None = None
    user_id: int | None = None 
    borrowed_date: date | None = None 
    returned_date: date | None = None
    is_borrowed: bool | None = None

class Book(BookBase, BookMetadata, BookInfo):
    """
    title: str
    author: str | None
    isbn: str 
    edition: str | None = None
    publisher: str | None = None
    publish_date: str | None = None 
    publish_place: str | None = None
    number_of_pages: int | None = None 
    description: str | None = None
    language: str | None = None 
    lccn: str | None = None 
    subtitle: str | None = None 
    subjects: str | None = None
    cover_image: bytes | None = None
    user_id: int | None = None 
    id: int
    added_date: date
    borrowed_date: date | None = None 
    returned_date: date | None = None
    is_borrowed: bool

    class Config:
        orm_mode = True
    """
    pass

#ONLY BOOK WITH ISBN IS ALLOWED TO BE CREATED
class BookCreate(BookBase, BookInfo):
    """    
    title: str
    author: str | None
    isbn: str 
    edition: str | None = None
    publisher: str | None = None
    publish_date: str | None = None 
    publish_place: str | None = None
    number_of_pages: int | None = None 
    description: str | None = None
    language: str | None = None 
    lccn: str | None = None 
    subtitle: str | None = None 
    subjects: str | None = None
    cover_image: bytes | None = None

    class Config:
        orm_mode = True
    """
    pass

class BookUpdate(BookBase, BookInfo, BookMetadata):
    title: str | None = None
    author: str | None = None
    isbn: str | None = None
    """    
    edition: str | None = None
    publisher: str | None = None
    publish_date: str | None = None 
    publish_place: str | None = None
    number_of_pages: int | None = None 
    description: str | None = None
    language: str | None = None 
    lccn: str | None = None 
    subtitle: str | None = None 
    subjects: str | None = None
    cover_image: bytes | None = None

    class Config:
        orm_mode = True
    """