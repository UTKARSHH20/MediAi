from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import auth, patients, predictions, dashboard

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediAI - Medical Diagnosis API",
    description="AI-powered medical diagnosis assistant with XGBoost, SHAP explainability, and full authentication",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(predictions.router, prefix="/api/v1/predict", tags=["Predictions"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {
        "message": "MediAI API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "patients": "/api/v1/patients",
            "predictions": "/api/v1/predict",
            "dashboard": "/api/v1/dashboard"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": str(__import__('datetime').datetime.utcnow())}