from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.responses import raise_error
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_access_token(token)
    if not user_id:
        raise_error(401, "Invalid or expired authentication token")

    user = UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise_error(401, "Authenticated user was not found")
    return user
