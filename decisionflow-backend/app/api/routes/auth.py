from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.responses import success_response
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, UserLoginRequest, UserRegisterRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    token_response = AuthService(db).register_user(payload)
    return success_response(token_response.model_dump(), "User registered successfully", 201)


@router.post("/login")
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    token_response = AuthService(db).login_user(payload.email, payload.password)
    return success_response(token_response.model_dump(), "User logged in successfully")


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    AuthService(db).change_password(current_user.id, payload.current_password, payload.new_password)
    return success_response(None, "Password changed successfully")
