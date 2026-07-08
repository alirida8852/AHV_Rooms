from datetime import date, datetime
import calendar

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models


router = APIRouter(prefix="/payment", tags=["Payment"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- ALL PAYMENTS ----------------

@router.get("/")
def get_all_payments(db: Session = Depends(get_db)):

    payments = db.query(models.Payment).all()

    result = []

    for payment in payments:

        booking = db.query(models.Booking).filter(
            models.Booking.id == payment.booking_id
        ).first()

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

        result.append({
            "payment_id": payment.id,
            "tenant": tenant.name,
            "phone": tenant.phone,
            "pg": pg.name,
            "room": room.room_number,
            "bed": bed.bed_number,
            "month": payment.month,
            "rent": payment.amount,
            "food_charge": payment.food_charge,
            "total": payment.amount + payment.food_charge,
            "status": payment.payment_status,
            "payment_date": payment.payment_date
        })

    return result


# ---------------- PG PAYMENTS ----------------

@router.get("/pg/{pg_id}")
def get_pg_payments(pg_id: int, db: Session = Depends(get_db)):

    rooms = db.query(models.Room).filter(
        models.Room.pg_id == pg_id
    ).all()

    room_ids = [room.id for room in rooms]

    beds = db.query(models.Bed).filter(
        models.Bed.room_id.in_(room_ids)
    ).all()

    bed_ids = [bed.id for bed in beds]

    bookings = db.query(models.Booking).filter(
        models.Booking.bed_id.in_(bed_ids)
    ).all()

    booking_ids = [booking.id for booking in bookings]

    payments = db.query(models.Payment).filter(
        models.Payment.booking_id.in_(booking_ids)
    ).all()

    result = []

    for payment in payments:

        booking = db.query(models.Booking).filter(
            models.Booking.id == payment.booking_id
        ).first()

        tenant = db.query(models.Tenant).filter(
            models.Tenant.id == booking.tenant_id
        ).first()

        bed = db.query(models.Bed).filter(
            models.Bed.id == booking.bed_id
        ).first()

        room = db.query(models.Room).filter(
            models.Room.id == bed.room_id
        ).first()

        result.append({
            "payment_id": payment.id,
            "tenant": tenant.name,
            "room": room.room_number,
            "bed": bed.bed_number,
            "month": payment.month,
            "rent": payment.amount,
            "food_charge": payment.food_charge,
            "total": payment.amount + payment.food_charge,
            "status": payment.payment_status,
            "payment_date": payment.payment_date
        })

    return result


# ---------------- DUE PAYMENTS ----------------

@router.get("/due")
def due_payments(db: Session = Depends(get_db)):

    today = date.today()

    payments = db.query(models.Payment).all()

    result = []

    for payment in payments:

        booking = db.query(models.Booking).filter(
            models.Booking.id == payment.booking_id,
            models.Booking.active == True
        ).first()

        if booking is None:
            continue

        if payment.payment_status != "Paid":

            if today.day > booking.rent_due_day:
                payment.payment_status = "Overdue"

            elif today.day == booking.rent_due_day:
                payment.payment_status = "Due"

            else:
                payment.payment_status = "Pending"

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

        result.append({
            "payment_id": payment.id,
            "tenant": tenant.name,
            "phone": tenant.phone,
            "pg": pg.name,
            "room": room.room_number,
            "bed": bed.bed_number,
            "month": payment.month,
            "rent": payment.amount,
            "food_charge": payment.food_charge,
            "total": payment.amount + payment.food_charge,
            "status": payment.payment_status
        })

    db.commit()

    return result


# ---------------- RECEIVE PAYMENT ----------------

# ---------------- RECEIVE PAYMENT ----------------

@router.post("/pay/{payment_id}")
def receive_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):

    payment = db.query(models.Payment).filter(
        models.Payment.id == payment_id
    ).first()

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    if payment.payment_status == "Paid":
        raise HTTPException(
            status_code=400,
            detail="Already paid"
        )

    booking = db.query(models.Booking).filter(
        models.Booking.id == payment.booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Check if this is the first payment
    first_payment = not booking.deposit_received

    # ---------------- Calculate Total ----------------

    total_received = (
        payment.amount
        + payment.food_charge
        + payment.maintenance_deduction
    )

    # Add deposit only on first payment
    if first_payment:
        total_received += booking.deposit
        booking.deposit_received = True

    # ---------------- Mark payment as paid ----------------

    payment.payment_status = "Paid"
    payment.payment_date = date.today()

    # ---------------- Create next month's payment ----------------

    current = datetime.strptime(
        payment.month,
        "%B %Y"
    )

    month = current.month + 1
    year = current.year

    if month > 12:
        month = 1
        year += 1

    next_month = f"{calendar.month_name[month]} {year}"

    existing = db.query(models.Payment).filter(
        models.Payment.booking_id == booking.id,
        models.Payment.month == next_month
    ).first()

    if existing is None:

        next_payment = models.Payment(
            booking_id=booking.id,
            month=next_month,
            amount=booking.monthly_rent,
            food_charge=booking.food_charge,
            payment_status="Pending",
            payment_date=None,
            maintenance_deduction=0,
            refund_amount=0
        )

        db.add(next_payment)

    db.commit()

    return {
        "message": "Payment received successfully",
        "rent": payment.amount,
        "food_charge": payment.food_charge,
        "maintenance_deduction": payment.maintenance_deduction,
        "deposit": booking.deposit if first_payment else 0,
        "total_received": total_received
    }