
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.flood_events import router as flood_events_router
from app.routers.forecast import router as forecast_router
from app.routers.historical import router as historical_router
from app.routers.difficulty import router as difficulty_router
from app.routers.explainability import router as explainability_router


app = FastAPI(
    title="FloodWatch API",
    description=(
        "Backend API for historical flood forecasting, "
        "event difficulty analysis, and explainability."
    ),
    version="0.1.0",
)

# CORS: allow the Vite frontend to access the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers.
app.include_router(flood_events_router)
app.include_router(forecast_router)
app.include_router(historical_router)
app.include_router(difficulty_router)
app.include_router(explainability_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the FloodWatch API",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "FloodWatch",
    }
