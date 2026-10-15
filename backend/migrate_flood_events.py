from sqlalchemy import inspect, text

from app.database import engine


def migrate_flood_events():
    inspector = inspect(engine)

    if not inspector.has_table("flood_events"):
        print("Migration stopped: flood_events table does not exist.")
        return

    columns = {
        column["name"]
        for column in inspector.get_columns("flood_events")
    }

    if "episode_id" in columns:
        print("Migration not needed: episode_id already exists.")
        return

    if "event_id" not in columns:
        print("Migration stopped: neither expected identifier exists.")
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE flood_events "
                "RENAME COLUMN event_id TO episode_id"
            )
        )

    print("Migration successful: event_id renamed to episode_id.")


if __name__ == "__main__":
    migrate_flood_events()