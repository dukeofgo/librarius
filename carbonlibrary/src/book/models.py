import datetime

from sqlalchemy import Boolean, Date, ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from ..user import schemas


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(64))
    author: Mapped[str] = mapped_column(String(64))
    isbn: Mapped[str] = mapped_column(String(13))
    edition: Mapped[str | None] = mapped_column(String(64))
    publisher: Mapped[str | None] = mapped_column(String(64))
    publish_date: Mapped[str | None] = mapped_column(String(64))
    publish_place: Mapped[str | None] = mapped_column(String(64))
    number_of_pages: Mapped[str | None]
    description: Mapped[str | None] = mapped_column(String(1024))
    language: Mapped[str | None] = mapped_column(String(32))
    lccn: Mapped[str | None] = mapped_column(String(12))
    subtitle: Mapped[str | None] = mapped_column(String(1024))
    subjects: Mapped[str | None] = mapped_column(String(256))
    cover_image: Mapped[str | None] 
    #cover_image: Mapped[bytes | None] = mapped_column(LargeBinary)

    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    loan_to_user: Mapped["User"] = relationship(back_populates="borrowed_books")

    added_date: Mapped[datetime.date] = mapped_column(Date, default=datetime.date.today())
    borrowed_date: Mapped[datetime.date | None] 
    returned_date: Mapped[datetime.date | None] 

    is_borrowed: Mapped[bool] = mapped_column(Boolean, default=False)

    def borrow(self, user: schemas.User):
        self.loan_to_user = user
        self.borrowed_date = datetime.date.today()
        self.returned_date = None
        self.is_borrowed = True

    def return_book(self):
        self.loan_to_user = None
        self.borrowed_date = None
        self.returned_date = datetime.date.today()
        self.is_borrowed = False