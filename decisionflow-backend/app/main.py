from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="DecisionFlow MVP backend with OpenRouter-powered extraction and recommendation services.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {"success": False, "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content=detail)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content=jsonable_encoder({"success": False, "message": "Validation failed", "details": exc.errors()}),
    )


@app.get("/health", tags=["Health"])
def health_check():
    return {"success": True, "message": "DecisionFlow backend is healthy", "data": {"status": "ok"}}


app.include_router(api_router)
