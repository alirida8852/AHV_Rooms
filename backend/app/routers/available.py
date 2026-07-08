from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models

router = APIRouter(
    prefix="/availability",
    tags=["Availability"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def available_rooms(
    sharing: int,
    pg_id: int | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(models.Room)

    if pg_id is not None:
        query = query.filter(models.Room.pg_id == pg_id)

    rooms = query.all()

    result = []

    for room in rooms:

        # Skip rooms that don't match sharing
        if room.capacity != sharing:
            continue

        pg = db.query(models.PG).filter(
            models.PG.id == room.pg_id
        ).first()

        beds = db.query(models.Bed).filter(
            models.Bed.room_id == room.id
        ).all()

        available_beds = [
            bed for bed in beds
            if bed.status and bed.status.lower() == "available"
        ]

        if len(available_beds) == 0:
            continue

        result.append({
            "pg_id": pg.id,
            "pg": pg.name,
            "room_id": room.id,
            "room_number": room.room_number,
            "sharing": room.capacity,
            "rent": room.rent,
            "available_beds": len(available_beds),
            "total_beds": len(beds)
        })

    return result