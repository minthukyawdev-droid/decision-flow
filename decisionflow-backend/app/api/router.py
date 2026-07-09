from fastapi import APIRouter

from app.api.routes import auth, decisions, recommendations, transcripts, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(decisions.router)
api_router.include_router(transcripts.router)
api_router.include_router(recommendations.router)
