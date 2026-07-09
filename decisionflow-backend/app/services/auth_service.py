from sqlalchemy.orm import Session

from app.core.responses import raise_error
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse, UserRegisterRequest


class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)

    def register_user(self, payload: UserRegisterRequest) -> TokenResponse:
        existing_user = self.user_repository.get_by_email(payload.email)
        if existing_user:
            raise_error(409, "Email is already registered")

        user = self.user_repository.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
        )
        return self._build_token_response(user)

    def login_user(self, email: str, password: str) -> TokenResponse:
        user = self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise_error(401, "Invalid email or password")
        if not user.is_active:
            raise_error(403, "User account is inactive")
        return self._build_token_response(user)

    def change_password(self, user_id: str, current_password: str, new_password: str) -> None:
        user = self.user_repository.get_by_id(user_id)
        if not user:
            raise_error(404, "User not found")
        if not verify_password(current_password, user.hashed_password):
            raise_error(400, "Current password is incorrect")
        if verify_password(new_password, user.hashed_password):
            raise_error(400, "New password must be different from the current password")

        self.user_repository.update_password(user, hash_password(new_password))

    def _build_token_response(self, user) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(subject=user.id),
            user={"id": user.id, "email": user.email, "full_name": user.full_name},
        )
