from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.services.forecast_service import forecast

router = APIRouter(
    prefix="/api/forecast",
    tags=["Forecast"],
)


@router.get("/")
def get_forecast(
    as_of_date: date = Query(
        ...,
        description="Historical forecast origin date (YYYY-MM-DD)",
    ),
):
    """
    Generate 1-day, 3-day, and 5-day discharge forecasts.
    """
    try:
        results = forecast(as_of_date.isoformat())

        return {
            "project": "FloodWatch",
            "forecast_origin": as_of_date.isoformat(),
            "forecasts": results,
        }

    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Forecast generation failed.",
        ) from exc
