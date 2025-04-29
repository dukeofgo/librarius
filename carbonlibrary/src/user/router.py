from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy.orm import Session

import jwt
from ..auth import dependencies
from . import crud, schemas
from ..database import get_db
from ..auth.dependencies import oauth2_scheme
from ..auth import config
router = APIRouter(
    prefix = "/users",
)

@router.post("/create", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create new user
    """
    # Check if user already existed
    db_user = crud.get_user_by_email(email=user.email, db=db)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(user=user, db=db)

@router.get(
    "/metadata/",
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
    ])
def read_token_data(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Retrieve data from token
    """
    payload = jwt.decode(token, config.SECRET_KEY, config.JWT_ALGORITHM)
    payload_email = payload.get("email")
    payload_scope = payload.get("scope")
    return {
        "email": payload_email,
        "scope": payload_scope,
        "isAuth": True,
    }

@router.get(
    "/retrieve/{email}", 
    response_model=schemas.UserResponse,
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
        Depends(dependencies.confirm_user_authorization)
    ])
def read_user(email: str, db: Session = Depends(get_db)):
    """
    Retrieve exiting user with email
    """
    db_user = crud.get_user_by_email(email=email, db=db)
    if not db_user: 
        raise HTTPException(status_code=404, detail="Target user does not exist")
    return db_user

"""IF YOU GET 422 Unprocessable Entity ERROR, 
SPECIFICALLY THIS ERROR 

detail:[{type: "json_invalid", loc: ["body", 20], msg: "JSON decode error", input: {},…}]

AND YOUR REQUEST BODY LOOKS SOMETHING LIKE THIS 

{
  "name": "Kenny",
}

CONSIDER CHECKING MISSING OR ADDITIONAL SIGNS OR COMMAS IN THE REQUEST BODY

{
  "name": "Kenny"
}
"""

@router.patch(
    "/update/{email}", 
    response_model=schemas.UserUpdate,     
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
        Depends(dependencies.confirm_user_authorization)
    ])
def update_user(email: str, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    """
    Update existing user
    """
    db_user = crud.get_user_by_email(email=email, db=db)
    if not db_user:
        raise HTTPException(status_code=400, detail="Target user does not exist")
    return crud.update_user(email=email, user=user, db=db)

@router.delete(
    "/delete/{email}",     
    dependencies=[
        Security(dependencies.authorize_current_user, scopes=["user", "admin", "superuser"]), 
        Depends(dependencies.confirm_user_authorization)
    ])
def delete_user(email: str, db: Session = Depends(get_db)):
    """
    Delete user from database
    """
    db_user = crud.get_user_by_email(email=email, db=db)
    if not db_user:
        raise HTTPException(status_code=400, detail="Target user does not exist")
    return crud.delete_user(email=email, db=db)


