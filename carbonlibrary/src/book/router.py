import base64
import os

import httpx
from botocore.exceptions import ClientError
from fastapi import (APIRouter, Depends, HTTPException, Response, Security,
                     UploadFile)
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from ..auth import dependencies
from ..aws import config
from ..database import get_db
from ..user import crud as crud_users
from ..utils import dict_parser
from . import crud as crud_books
from . import schemas

router = APIRouter(
    prefix = "/books",
)

TIMEOUT = 15.0

@router.post(
    "/create",
    response_model=schemas.BookCreate,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["admin", "superuser"])
    ])
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    """
    Create a new book in the database.
    """
    if crud_books.get_book_by_isbn(isbn=book.isbn, db=db):
        raise HTTPException(status_code=400, detail="Book already exist")  
    return crud_books.create_book(book=book, db=db)

@router.post(
    "/create/{isbn}", 
    response_model=schemas.BookCreate,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["admin", "superuser"])
    ])
async def create_book_by_isbn(isbn: str, db: Session = Depends(get_db)):
    """
    Create a new book in the database by fetching data from Open Library API using ISBN.
    """

    OPENLIB_URL = f"http://openlibrary.org/api/volumes/brief/isbn/{isbn}.json"
    
    #request data from external API
    async with httpx.AsyncClient() as client:
        try:
            book_response = await client.get(OPENLIB_URL, timeout=TIMEOUT)

        except httpx.ReadTimeout:
            raise HTTPException(status_code=400, detail= "Request Time Out") 
        except httpx.RequestError:
            raise HTTPException(status_code=400, detail= "Request Error")
        
    #retrieve dict data from HTTP response object
    dict_content = book_response.json()
    #call list on dict to return keys of dictionary as list, instead of .keys(), as it returns key_dicts obj which is hard to handle
    OPENLIB_KEY = (list(dict_content.get('records')))[0] 
    #there are multiple isbns in the isbn list ['0316414247', '9780316414241'], isbn_matching makes sure to retrieve the exact isbn that user specified.
    isbn_matching = dict_parser(dict_content, ['records', OPENLIB_KEY, 'isbns']).index(isbn)
    #select certain book fields from dictionary using dict_parser function in utils.py
    selected_keys = {
        'title': dict_parser(dict_content, ['records', OPENLIB_KEY, 'data', 'title']).title(),
        'author': dict_parser(dict_content, ['records', OPENLIB_KEY, 'data', 'authors', 0, 'name']),
        'edition': dict_parser(dict_content, ['records', OPENLIB_KEY, 'details', 'details', 'edition_name']),
        'publisher': dict_parser(dict_content, ['records', OPENLIB_KEY, 'data', 'publishers', 0, 'name']),
        'publish_date': dict_parser(dict_content, ['records', OPENLIB_KEY, 'publishDates', 0]),
        'publish_place': dict_parser(dict_content, ['records', OPENLIB_KEY, 'details', 'details', 'publish_country']),
        'number_of_pages': dict_parser(dict_content, ['records', OPENLIB_KEY, 'data', 'number_of_pages']),
        'description': dict_parser(dict_content, ['records', OPENLIB_KEY, 'details', 'details', 'description', 'value']),
        'language': dict_parser(dict_content, ['records', OPENLIB_KEY, 'details', 'details', 'languages', 0, 'key']),
        'isbn': dict_parser(dict_content, ['records', OPENLIB_KEY, 'isbns', isbn_matching]),
        'lccn': dict_parser(dict_content, ['records', OPENLIB_KEY, 'lccns', 0]),
        'subtitle': dict_parser(dict_content, ['records', OPENLIB_KEY, 'data', 'subtitle']),
        'subjects': dict_parser(dict_content, ['records', OPENLIB_KEY, 'details', 'details', 'subjects', 0]),
    }

    #convert python dict to pydantic object
    book = schemas.BookCreate(**selected_keys)

    return crud_books.create_book(book=book, db=db)

@router.get(
    "/retrieve/books", 
    response_model=list[schemas.Book],
)
def get_books(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Retrieve a list of books from the database.
    """
    db_books = crud_books.get_books(skip=skip, limit=limit, db=db)
    return db_books

@router.get(
    "/retrieve/{isbn_or_id}", 
    response_model=schemas.Book,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
        ])
def get_book_by_isbn_id(isbn_or_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a book by its ISBN or ID.
    """
    db_book = crud_books.get_book_by_isbn_or_id(isbn_or_id=isbn_or_id, db=db)
    if not db_book:
        raise HTTPException(status_code=400, detail="Book not found")
    return db_book 

@router.patch(
    "/update/{book_id}", 
    response_model=schemas.BookUpdate,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["admin", "superuser"]),
    ])
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(get_db)):
    """"
    Update an existing book in the database.
    """
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)
    if not db_book:
        raise HTTPException(status_code=400, detail="Book not found")
    return crud_books.update_book(book_id=book_id, book=book, db=db)

@router.delete(
    "/delete/{book_id}",
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    ])
def delete_book(book_id: int, db: Session = Depends(get_db)):
    """
    Delete a book from the database.
    """
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)
    if not db_book:
        raise HTTPException(status_code=400, detail="Target book does not exist")
    return crud_books.delete_book(book_id=book_id, db=db)

@router.patch(
    "/borrow/{email}/{book_id}",
    response_model=schemas.BookUpdate,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    ])
def borrow_book(email: str, book_id: int, db: Session = Depends(get_db)):
    """
    Borrow a book from the library.
    """
    db_user = crud_users.get_user_by_email(email=email, db=db)
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)
    
    if not (db_user or db_book):
        raise HTTPException(status_code=400, detail="Target user and book do not exist")
    if db_book.is_borrowed:
        raise HTTPException(status_code=400, detail="Book is already borrowed by another user")
    
    db_book.borrow(db_user)
    return crud_books.update_book(book_id=book_id, db=db)
    
@router.patch(
    "/return/{email}/{book_id}",
    response_model=schemas.BookUpdate,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    ])
def return_book(email: str, book_id: int, db: Session = Depends(get_db)):
    """
    Return a borrowed book to the library.
    """
    db_user = crud_users.get_user_by_email(email=email, db=db)
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)
    
    if not (db_user or db_book):
        raise HTTPException(status_code=400, detail="Target user and book do not exist")
    if not db_book.is_borrowed:
        raise HTTPException(status_code=400, detail="Target book has not been borrowed")
    if db_book.user_id != db_user.id:
         raise HTTPException(status_code=400, detail="User did not borrow this specific book")
    
    db_book.return_book()
    return crud_books.update_book(book_id=book_id, db=db)

@router.patch(
    "/update/cover/{book_id}",
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    ])
async def upload_book_cover(cover_img: UploadFile, book_id: int, db: Session= Depends(get_db)):
    """
    Upload a cover image for a book with book id.
    """
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)

    if not db_book:
        raise HTTPException(status_code=400, detail="Target book does not exist")
    if not cover_img:
        raise HTTPException(status_code=400, detail="Cover image was not uploaded properly")
    if not book_id:
        raise HTTPException(status_code=400, detail="Book id was not specified")
    
    img_content = await cover_img.read()

    return crud_books.update_book_cover(img_content=img_content, book_id=book_id, db=db)

@router.get(
    "/retrieve/cover/{book_id}",
    dependencies={
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    })
def retrieve_book_cover(book_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the cover image of a book by its ID.
    """
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)

    if not db_book:
        raise HTTPException(status_code=400, detail="Target book does not exist")
    if not db_book.cover_image:
        raise HTTPException(status_code=400, detail="Target book does not have cover image")
    # cover_image data is stored as utf-8 string in database
    # To have image as response, the response must be in RAW BINARY DATA 
    # Decode data from utf-8 string, bypassing base64 bytes, to RAW BINARY directly
    decoded_image_data = base64.b64decode(db_book.cover_image)

    return Response(content=decoded_image_data, media_type="image/jpg")

@router.post(
    "/upload/bookpdf/{book_id}",
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["admin", "superuser"]),
    ])

def upload_book_pdf(pdf_file: UploadFile, book_id: int, db: Session = Depends(get_db)):
    """
    Upload a PDF file for a book with book id.
    """
    db_book = crud_books.get_book_by_id(book_id=book_id, db=db)

    if not db_book:
        raise HTTPException(status_code=400, detail="Target book does not exist")

    try:
        # Ensure the file is a PDF
        if pdf_file.content_type != "application/pdf":
            raise HTTPException(status_code=500, detail="Only PDF files are allowed") 
        # Ensure the file is less than 100MB
        if pdf_file.size >= 100000000:
            raise HTTPException(status_code=500, detail="File size is too large, must be less than 100MB") 
        
        # Upload the file to the R2 bucket
        # The upload_fileobj method accepts a file-like object, 
        # so you can directly pass file.file without opening or reading it locally.
        config.s3_client.upload_fileobj(pdf_file.file, os.environ.get("CLOUDFLARE_R2_BUCKET"), f'{db_book.isbn}.pdf')

        return {"message": f"File uploaded successfully {db_book.isbn} "}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}") 

@router.get(
    "/retrieve/bookpdf/{isbn}",
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["admin", "superuser"]),
    ])
def retrieve_book_pdf(isbn: str):
    """
    Retrieve a PDF file for a book by its ISBN from Cloudflare R2.
    """
    try:
        # Generate a pre-signed URL
        presigned_url = config.s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": os.environ.get("CLOUDFLARE_R2_BUCKET"), 
                "Key": f"{isbn}.pdf",
                },
            ExpiresIn=3600,
        )
        # Return the pre-signed URL to the client
        return {"url": presigned_url}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
       
@router.get(
    "/retrieve/staticfile/cover-coming-soon.jpg",
)
def retrieve_static_file(filename: str):
    """
    Retrieve a static file from Cloudflare R2.
    """
    try:
        # Generate a pre-signed URL
        presigned_url = config.s3_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": os.environ.get("CLOUDFLARE_R2_BUCKET"), 
                "Key": filename,
                },
            ExpiresIn=3600,
        )
        # Return the pre-signed URL to the client
        return {"url": presigned_url}

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")