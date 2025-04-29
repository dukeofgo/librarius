import datetime
import os

import httpx
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from ..auth.dependencies import authorize_current_user, confirm_user_authorization
from ..book import crud as book_crud, models as book_models
from ..database import get_db
from ..main import Base, app
from ..user import models as user_models, crud as user_crud

TESTING_DATA_ISBN = "9780316414241"

POSTGRES_TEST_DATABASE_URL = os.environ.get("PG_TEST_DATABASE_URL")

engine = create_engine(POSTGRES_TEST_DATABASE_URL, echo=True) 

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(POSTGRES_TEST_DATABASE_URL, echo=True)
    
    Base.metadata.create_all(bind=engine)
    try: 
        with TestingSessionLocal() as session:
            yield session
    finally:
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def override_get_db():
        return session

    app.dependency_overrides[get_db] = override_get_db

    #dependency cannot be skipped, only replaced by sth. 
    # In this case, since 'authorize_current_user' & 'confirm_user_authorization' dependency func doesn't return anything, we can replace it with func that returns None
    # Had the dependency returns some value, we'd have to replace the dependency func with a func that return a value that could bypasses the dependency 
    app.dependency_overrides[authorize_current_user] = lambda: None
    app.dependency_overrides[confirm_user_authorization] = lambda: None

    client = TestClient(app) 

    yield client

    app.dependency_overrides.clear() 

def test_create_user(session: Session, client: TestClient):
    response = client.post('/api/users/create/', 
        json = {
            "password": "string",
            "email": "string",
            "name": "string",
            "age": 0
        })
    db_user = user_crud.get_user_by_email(db=session, email="string")

    assert response.status_code == 200
    assert db_user.email == "string"

def test_retrieve_user(session: Session, client: TestClient):
    User = user_models.User(email="string", name="string", hashed_password="string", age=0)

    session.add(User)
    session.commit()

    db_user = user_crud.get_user_by_email(db=session, email=User.email)

    response = client.get(f'/api/users/retrieve/{User.email}')
    response_email = response.json().get('email')

    assert response.status_code == 200
    assert response_email == db_user.email

def test_update_user(session: Session, client: TestClient):
    User = user_models.User(id= 0, email="string", name="string", hashed_password="string", age=0)

    session.add(User)
    session.commit()

    response = client.patch(f'/api/users/update/{User.email}',
        json = {
            "age": 11
        })

    db_user = user_crud.get_user_by_email(db=session, email=User.email)
    response_age = response.json().get('age')

    assert response.status_code == 200
    assert response_age == db_user.age

def test_delete_user(session: Session, client: TestClient):
    User = user_models.User(id= 0, email="string", name="string", hashed_password="string", age=0)

    session.add(User)
    session.commit()

    response = client.delete(f'/api/users/delete/{User.email}')

    assert response.status_code == 200

def test_create_book(session: Session, client: TestClient):
    response = client.post('/api/books/create/', 
        json={
            "edition": "string",
            "publisher": "string",
            "publish_date": "string",
            "publish_place": "string",
            "number_of_pages": 0,
            "description": "string",
            "language": "string",
            "lccn": "string",
            "subtitle": "string",
            "subjects": "string",
            "cover_image": "string",
            "title": "string",
            "author": "string",
            "isbn": TESTING_DATA_ISBN
        })

    db_book = book_crud.get_book_by_isbn(db = session, isbn = TESTING_DATA_ISBN)

    assert response.status_code == 200
    assert db_book.isbn == TESTING_DATA_ISBN

def test_create_book_by_isbn(session: Session, client: TestClient):
    # this is a way to pass in path parameter to request in httpx
    response = client.post(f'/api/books/create/{TESTING_DATA_ISBN}')

    db_book = book_crud.get_book_by_isbn(db = session, isbn = TESTING_DATA_ISBN)

    assert response.status_code == 200
    assert db_book.isbn == TESTING_DATA_ISBN

def test_retrieve_books(session: Session, client: TestClient):
    Book_1 = book_models.Book(title="Book1", author="Author1", isbn="isbn1")
    Book_2 = book_models.Book(title="Book2", author="Author2", isbn="isbn2")
    Book_3 = book_models.Book(title="Book3", author="Author3", isbn="isbn3")

    session.add(Book_1)
    session.add(Book_2)
    session.add(Book_3)
    session.commit()

    db_book_1 = book_crud.get_book_by_isbn(db=session, isbn="isbn1")
    db_book_2 = book_crud.get_book_by_isbn(db=session, isbn="isbn2")
    db_book_3 = book_crud.get_book_by_isbn(db=session, isbn="isbn3")

    response = client.get('/api/books/retrieve/books')

    assert response.status_code == 200
    assert db_book_1.isbn == "isbn1"
    assert db_book_2.isbn == "isbn2"
    assert db_book_3.isbn == "isbn3"

def test_retrieve_book(session: Session, client: TestClient):
    Book = book_models.Book(id = 0, title="Book", author="Author", isbn=TESTING_DATA_ISBN)

    session.add(Book)
    session.commit()

    response_by_id = client.get(f'/api/books/retrieve/{Book.id}')
    response_by_isbn = client.get(f'/api/books/retrieve/{Book.isbn}')

    assert response_by_id.status_code == 200
    assert response_by_isbn.status_code == 200
    assert response_by_id.json() == response_by_isbn.json()



def test_update_book(session: Session, client: TestClient):
    Book = book_models.Book(id = 0, title="Book", author="Author", isbn="isbn")

    session.add(Book)
    session.commit()

    response = client.patch(f'/api/books/update/{Book.id}',
        json = {
            "author": "theBook"
        })

    db_book = book_crud.get_book_by_isbn(db=session, isbn=Book.isbn)

    assert response.status_code == 200
    assert db_book.author == "theBook"

def test_delete_book(session: Session, client: TestClient):
    Book = book_models.Book(id = 0, title="Book", author="Author", isbn="isbn")

    session.add(Book)
    session.commit()

    response = client.delete(f'/api/books/delete/{Book.id}')

    assert response.status_code == 200

def test_book_borrow(session: Session, client: TestClient):
    Book = book_models.Book(id = 0, title="Book", author="Author", isbn="isbn")
    User = user_models.User(email = "name@email.com", name = "name", hashed_password = "string", age = 0)

    session.add(Book)
    session.add(User)
    session.commit()

    response = client.patch(f'/api/books/borrow/{User.email}/{Book.id}')

    db_book = book_crud.get_book_by_isbn(db=session, isbn=Book.isbn)
    db_user = user_crud.get_user_by_email(db=session, email=User.email)

    assert response.status_code == 200
    assert db_book.user_id == User.id
    assert db_book.is_borrowed == True
    assert db_user.borrowed_books[0] == db_book

def test_book_return(session: Session, client: TestClient):
    Book = book_models.Book(id = 0, title="Book", author="Author", isbn="isbn")
    User = user_models.User(email = "name@email.com", name = "name", hashed_password = "string", age = 0)

    session.add(Book)
    session.add(User)
    session.commit()

    db_book = book_crud.get_book_by_isbn(db=session, isbn=Book.isbn)
    db_user = user_crud.get_user_by_email(db=session, email=User.email)

    borrow_response = client.patch(f'/api/books/borrow/{User.email}/{Book.id}')
    assert borrow_response.status_code == 200
    assert db_book.user_id == User.id
    assert db_book.is_borrowed == True
    assert db_user.borrowed_books[0] == db_book

    return_response = client.patch(f'api/books/return/{User.email}/{Book.id}')
    assert return_response.status_code == 200
    assert db_book.user_id == None
    assert db_book.is_borrowed == False

