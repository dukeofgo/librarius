from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import service
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    """
    Get user by email
    
    :param email: User email
    :param db: Database session
    :return: Return user object
    """
    return db.execute(select(models.User).where(models.User.email == email)).scalars().first()

def create_user(user: schemas.UserCreate, db: Session):
    """
    Create a new user

    :param user: User object
    :param db: Database session
    :return: Return user object
    """
    #hash password with passlib
    user_hashed_password = service.hash_password(user.password)
    #instantiate User model
    db_user = models.User(email=user.email, name=user.name, age=user.age, hashed_password=user_hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def update_user(db: Session, user: schemas.UserUpdate, email: str):
    """
    Update existing user by email

    :param user: User pydantic object
    :param email: User email
    :param db: Database session
    :return: Return updated user object
    """
    #query user with user email
    query_user = get_user_by_email(email=email, db=db)

    if user:
        #turn user (pydantic model) into python dict
        #allow partial update with exclude_unset=True
        update_data = user.model_dump(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(query_user, key, value)

    db.add(query_user)
    db.commit()
    db.refresh(query_user)

    return query_user

def delete_user(db: Session, email: str):
    """
    Delete user by email
    
    :param email: User email
    :param db: Database session
    :return: Return successful message
    """
    db_user = get_user_by_email(email=email, db=db)

    db.delete(db_user)
    db.commit()

    return {"message": "User deleted successfully"} #consider add status code to response after returning