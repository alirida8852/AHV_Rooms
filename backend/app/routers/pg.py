from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas

router = APIRouter(
    prefix="/pg",
    tags=["PG"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- CREATE PG ----------------

@router.post("/", response_model=schemas.PGResponse)
def create_pg(
    pg: schemas.PGCreate,
    db: Session = Depends(get_db)
):

    new_pg = models.PG(
        name=pg.name,
        address=pg.address,
        owner_name=pg.owner_name,
        phone=pg.phone
    )

    db.add(new_pg)
    db.commit()
    db.refresh(new_pg)

    return new_pg


# ---------------- GET ALL PGs ----------------

@router.get("/", response_model=list[schemas.PGResponse])
def get_all_pgs(db: Session = Depends(get_db)):
    return db.query(models.PG).all()


# ---------------- GET SINGLE PG ----------------

@router.get("/{pg_id}", response_model=schemas.PGResponse)
def get_pg(
    pg_id: int,
    db: Session = Depends(get_db)
):

    pg = db.query(models.PG).filter(
        models.PG.id == pg_id
    ).first()

    if not pg:
        raise HTTPException(
            status_code=404,
            detail="PG not found"
        )

    return pg


# ---------------- UPDATE PG ----------------

@router.put("/{pg_id}", response_model=schemas.PGResponse)
def update_pg(
    pg_id: int,
    data: schemas.PGCreate,
    db: Session = Depends(get_db)
):

    pg = db.query(models.PG).filter(
        models.PG.id == pg_id
    ).first()

    if not pg:
        raise HTTPException(
            status_code=404,
            detail="PG not found"
        )

    pg.name = data.name
    pg.address = data.address
    pg.owner_name = data.owner_name
    pg.phone = data.phone

    db.commit()
    db.refresh(pg)

    return pg


# ---------------- DELETE PG ----------------

@router.delete("/{pg_id}")
def delete_pg(
    pg_id: int,
    db: Session = Depends(get_db)
):

    pg = db.query(models.PG).filter(
        models.PG.id == pg_id
    ).first()

    if not pg:
        raise HTTPException(
            status_code=404,
            detail="PG not found"
        )

    rooms = db.query(models.Room).filter(
        models.Room.pg_id == pg_id
    ).all()

    # Prevent deleting PG with active tenants
    for room in rooms:

        beds = db.query(models.Bed).filter(
            models.Bed.room_id == room.id
        ).all()

        for bed in beds:

            active_booking = db.query(models.Booking).filter(
                models.Booking.bed_id == bed.id,
                models.Booking.active == True
            ).first()

            if active_booking:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete PG with active tenants"
                )

    # Delete all expenses
    db.query(models.Expense).filter(
        models.Expense.pg_id == pg_id
    ).delete()

    # Delete rooms and all related data
    for room in rooms:

        beds = db.query(models.Bed).filter(
            models.Bed.room_id == room.id
        ).all()

        for bed in beds:

            bookings = db.query(models.Booking).filter(
                models.Booking.bed_id == bed.id
            ).all()

            for booking in bookings:

                db.query(models.Payment).filter(
                    models.Payment.booking_id == booking.id
                ).delete()

                tenant = db.query(models.Tenant).filter(
                    models.Tenant.id == booking.tenant_id
                ).first()

                db.delete(booking)

                if tenant:
                    db.delete(tenant)

            db.delete(bed)

        db.delete(room)

    db.delete(pg)

    db.commit()

    return {
        "message": "PG deleted successfully"
    }