from fastapi import APIRouter
from .endpoints import auth, predict, explain, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(predict.router, prefix="/predict", tags=["predict"])
api_router.include_router(explain.router, prefix="/explain", tags=["explain"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
