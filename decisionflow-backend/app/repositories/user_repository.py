from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def create(self, email: str, full_name: str, hashed_password: str) -> User:
        user = User(email=email.lower(), full_name=full_name, hashed_password=hashed_password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        self.db.commit()
        self.db.refresh(user)
        return user
