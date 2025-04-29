from datetime import date, datetime
from enum import Enum
from ..book.schemas import Book
from pydantic import BaseModel

class UserStatus(str, Enum):
    SUPERUSER = "superuser"
    ADMIN = "admin"
    USER = "user"

class UserBase(BaseModel):
    email: str
    name: str
    age: int | None = None

    class Config:
        orm_mode = True

class UserMetadata(BaseModel):
    id: int | None = None
    status: UserStatus | None = None
    is_active: bool | None = None
    is_borrower: bool | None = None
    is_member: bool | None = None
    borrowed_books: list[Book] | None = None
    registered_date: date | None = None
    
class UserCredential(BaseModel):
    password: str

class User(UserBase, UserCredential, UserMetadata): 
    """
    email: str
    name: str
    age: int
    hashed_password: str
    id: int
    status: UserStatus 
    is_active: bool
    is_borrower: bool
    is_member: bool
    borrowed_books: list[schemas.Book]
    registered_date: date 

    class Config:
        orm_mode = True
    """
    pass

class UserResponse(UserBase, UserMetadata):
    pass

class UserCreate(UserBase, UserCredential):
    pass

class UserUpdate(UserBase, UserMetadata):
    email: str | None = None
    name: str | None = None
    age: int | None = None
    
class JWTTokenData(BaseModel):
    email: str
    scope: str | None 
    expire_date: datetime 
