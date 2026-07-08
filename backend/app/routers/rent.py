from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models

from datetime import date

router = APIRouter(
    prefix="/rent-due",
    tags=["Rent Due"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def rent_due_list(db: Session = Depends(get_db)):

    today = date.today().day

    bookings = db.query(models.Booking).filter(
        models.Booking.active == True
    ).all()

    due_list = []

    for booking in bookings:

        tenant = db.query(models.Tenant).filter(
            models.Tenant.id == booking.tenant_id
        ).first()

        bed = db.query(models.Bed).filter(
            models.Bed.id == booking.bed_id
        ).first()

        room = db.query(models.Room).filter(
            models.Room.id == bed.room_id
        ).first()

        pg = db.query(models.PG).filter(
            models.PG.id == room.pg_id
        ).first()

        payment = db.query(models.Payment).filter(
            models.Payment.booking_id == booking.id,
            models.Payment.month == date.today().strftime("%Y-%m")
        ).first()

        if payment and payment.payment_status == "Paid":
            continue

        overdue_days = max(0, today - booking.rent_due_day)

        due_list.append({
            "tenant": tenant.name,
            "phone": tenant.phone,
            "pg": pg.name,
            "room": room.room_number,
            "bed": bed.bed_number,
            "rent": booking.monthly_rent,
            "due_day": booking.rent_due_day,
            "overdue_days": overdue_days,
            "status": "Overdue" if overdue_days > 0 else "Due"
        })

    due_list.sort(key=lambda x: x["due_day"])

    return due_list