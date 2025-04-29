import base64

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from . import models, schemas


def get_book_by_id(db: Session, book_id: int) -> models.Book | None:
    """
    Retrieve a book by its ID.

    :param book_id: ID of the book to retrieve.
    :param db: Database session.
    :return: Return book object if found, else None.
    """
    return db.execute(select(models.Book).where(models.Book.id == book_id)).scalars().first()

def get_book_by_isbn(db: Session, isbn: str) -> models.Book | None:  
    """
    Retrieve a book by its ISBN.

    :param isbn: ISBN of the book to retrieve.
    :param db: Database session.
    :return: Return book object if found, else None.
    """ 
    return db.execute(select(models.Book).where(models.Book.isbn == isbn)).scalars().first()

def get_book_by_isbn_or_id(db: Session, isbn_or_id: str) -> models.Book | None:
    """
    Retrieve a book by its ISBN or ID.

    :param isbn_or_id: ISBN or ID of the book to retrieve.
    :param db: Database session.
    :return: Return book object if found, else None.
    """
    return db.execute(select(models.Book).where(or_(models.Book.isbn == isbn_or_id, models.Book.id == int(isbn_or_id)))).scalars().first()

def get_books(db: Session, skip: int = 0, limit: int = 20) -> list[models.Book]:
    """
    Retrieve a list of books with pagination.

    :param skip: Number of books to skip.
    :param limit: Number of books to retrieve.
    :param db: Database session.
    :return: List of books.
    """
    return db.execute(select(models.Book).offset(skip).limit(limit)).scalars().all()

def create_book(db: Session, book: schemas.BookCreate) -> models.Book | None:
    """
    Create a new book.

    :param book: Book pydantic object
    :param db: Database session.
    :return: Return book object if created, else None.
    """
    #PYDANTIC SCHEMASas - PYTHON DICT- SQLALCHEMY MODELS
    #convert pydantic model to python dict
    book_dict = book.model_dump(exclude_unset=True)
    #unpack book_dict into model
    db_book = models.Book(**book_dict)

    db.add(db_book)
    db.commit()
    db.refresh(db_book)

    return db_book

def update_book(db: Session, book_id: int, book: schemas.BookUpdate | None = None) -> models.Book | None:
    """
    Update an existing book.
    
    :param book_id: ID of the book to update.
    :param book: Book pydantic object
    :param db: Database session.
    :return: Return updated book object if successful, else None.
    
    """
    query_book = get_book_by_id(db=db, book_id=book_id)

    if book:
        #convert pydantic model to python dict
        update_data = book.model_dump(exclude_unset=True)
        
        """If fields have been modified, setattr, if not then skip setattr"""
        if update_data:
            for key, value in update_data.items():
                setattr(query_book, key, value)

    db.add(query_book)
    db.commit()
    db.refresh(query_book)

    return query_book

def delete_book(db: Session, book_id: int) -> dict | None:
    """
    Delete a book by its ID.
    
    :param book_id: ID of the book to delete.
    :param db: Database session.
    :return: Return success message if deleted, else None.
    """
    db_book = get_book_by_id(db=db, book_id=book_id)

    db.delete(db_book)
    db.commit()

    return {"message": "Book deleted successfully"}

def update_book_cover(img_content: bytes, book_id: int, db: Session) -> dict | None:
    """
    Update the cover image of a book.
    
    :param img_content: Image content in bytes.
    :param book_id: ID of the book to update.
    :param db: Database session.
    :return: Return success message if updated, else None.
    """
    db_book = get_book_by_id(book_id=book_id, db=db)

    # RAW BINARY DATA is difficult to handle and not compatible with JSON, so it is easier to convert RAW BINARY to utf-8 string first, if you want to store image in database
    # Encode RAW BINARY to Base64 bytes(b'abcdef'), and convert to UTF-8 string ("ghijkl")
    encoded_image_data = base64.b64encode(img_content).decode('utf-8')
    # Store the encoded data to database of db_book
    db_book.cover_image = encoded_image_data
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    return {"message": "success upload"}
