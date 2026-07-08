from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from app import models


@router.get("/")
def search(query: str, db: Session = Depends(get_db)):

    results = []

    # ---------------- Search Tenant ----------------

    tenants = db.query(models.Tenant).all()

    for tenant in tenants:

        if (
            query.lower() in tenant.name.lower()
            or query in tenant.phone
        ):

            booking = db.query(models.Booking).filter(
                models.Booking.tenant_id == tenant.id,
                models.Booking.active == True
            ).first()

            room_number = None
            pg_name = None
            bed_number = None

            if booking:

                bed = db.query(models.Bed).filter(
                    models.Bed.id == booking.bed_id
                ).first()

                if bed:

                    bed_number = bed.bed_number

                    room = db.query(models.Room).filter(
                        models.Room.id == bed.room_id
                    ).first()

                    if room:

                        room_number = room.room_number

                        pg = db.query(models.PG).filter(
                            models.PG.id == room.pg_id
                        ).first()

                        if pg:
                            pg_name = pg.name

            results.append({
                "type": "Tenant",
                "name": tenant.name,
                "phone": tenant.phone,
                "pg": pg_name,
                "room": room_number,
                "bed": bed_number
            })

    # ---------------- Search Room ----------------

    rooms = db.query(models.Room).all()

    for room in rooms:

        if query.lower() in room.room_number.lower():

            pg = db.query(models.PG).filter(
                models.PG.id == room.pg_id
            ).first()

            results.append({
                "type": "Room",
                "room": room.room_number,
                "pg": pg.name if pg else None
            })

    return results