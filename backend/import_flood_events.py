from pathlib import Path

import pandas as pd
from sqlalchemy import select

from app.database import SessionLocal
from app.models.flood_event import FloodEvent


CSV_PATH = (
    Path(__file__).resolve().parents[1]
    / "ml"
    / "notebooks"
    / "event_characteristics.csv"
)

REQUIRED_COLUMNS = {
    "episode_id",
    "start",
    "end",
    "duration_days",
    "peak_discharge",
    "peak_date",
}


def import_flood_events():
    if not CSV_PATH.is_file():
        raise FileNotFoundError(f"Research file not found: {CSV_PATH}")

    df = pd.read_csv(CSV_PATH)

    missing_columns = REQUIRED_COLUMNS - set(df.columns)
    if missing_columns:
        raise ValueError(
            f"CSV is missing required columns: {sorted(missing_columns)}"
        )

    if df.empty:
        raise ValueError("The research CSV contains no event records.")

    if df[list(REQUIRED_COLUMNS)].isna().any().any():
        raise ValueError("The research CSV contains missing required values.")

    if df["episode_id"].duplicated().any():
        raise ValueError("The research CSV contains duplicate episode IDs.")

    df["start"] = pd.to_datetime(df["start"], errors="raise").dt.date
    df["end"] = pd.to_datetime(df["end"], errors="raise").dt.date
    df["peak_date"] = pd.to_datetime(
        df["peak_date"], errors="raise"
    ).dt.date

    if (df["end"] < df["start"]).any():
        raise ValueError("An event ends before it starts.")

    with SessionLocal() as db:
        existing_ids = set(
            db.scalars(select(FloodEvent.episode_id)).all()
        )

        incoming_ids = set(df["episode_id"].astype(int))
        duplicates = existing_ids & incoming_ids

        if duplicates:
            raise ValueError(
                "Import stopped; these episode IDs already exist: "
                f"{sorted(duplicates)}"
            )

        for row in df.to_dict(orient="records"):
            db.add(
                FloodEvent(
                    episode_id=int(row["episode_id"]),
                    start_date=row["start"],
                    end_date=row["end"],
                    duration_days=int(row["duration_days"]),
                    peak_discharge=float(row["peak_discharge"]),
                    peak_date=row["peak_date"],
                )
            )

        db.commit()
        print(f"Successfully imported {len(df)} historical flood events.")


if __name__ == "__main__":
    import_flood_events()