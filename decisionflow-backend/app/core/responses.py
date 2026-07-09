from typing import Any

from fastapi import HTTPException
from fastapi.responses import JSONResponse


def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "message": message, "data": data},
    )


def raise_error(status_code: int, message: str, details: Any = None) -> None:
    raise HTTPException(
        status_code=status_code,
        detail={"success": False, "message": message, "details": details},
    )
