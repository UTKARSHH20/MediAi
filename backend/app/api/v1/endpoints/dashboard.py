from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats():
    # TODO: Return analytics dashboard data
    return {"message": "Dashboard stats"}
