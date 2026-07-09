from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.core.responses import success_response
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return success_response(
        {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
        },
        "Current user retrieved",
    )
