from typing import Generic, TypeVar

from pydantic import BaseModel

ResponseData = TypeVar("ResponseData")


class ApiResponse(BaseModel, Generic[ResponseData]):
    success: bool
    message: str
    data: ResponseData | None = None
