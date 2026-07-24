from fastapi import APIRouter

router = APIRouter()

@router.post("/shap")
def explain_shap():
    # TODO: Implement SHAP explanation for predictions
    return {"message": "SHAP explanation"}
