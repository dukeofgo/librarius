from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from sqlalchemy.ext.declarative import declarative_base

POSTGRES_DATABASE_URL = os.environ.get("PG_DATABASE_URL")
# POSTGRES_FILE_NAME = "user:password@postgresserver/db"
# POSTGRES_DATABASE_URL = f"postgresql://{POSTGRES_FILE_NAME}"

# remove echo=True argument in production
engine = create_engine(POSTGRES_DATABASE_URL, echo=True) 

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
