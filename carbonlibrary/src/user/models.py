import datetime
from typing import List

from sqlalchemy import Boolean, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .schemas import UserStatus


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(64))
    age: Mapped[int | None] 
    status: Mapped[UserStatus] = mapped_column(default=UserStatus.USER)

    registered_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.date.today())
    hashed_password: Mapped[str]
    borrowed_books: Mapped[list["Book"]] = relationship(back_populates="loan_to_user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_borrower: Mapped[bool] = mapped_column(Boolean, default=False)
    is_member: Mapped[bool] = mapped_column(Boolean, default=False) 