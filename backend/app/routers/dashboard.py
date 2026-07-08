from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models
from app.routers import payment


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Overall Dashboard ----------------

@router.get("/")
def dashboard(db: Session = Depends(get_db)):

    total_pgs = db.query(models.PG).count()
    total_rooms = db.query(models.Room).count()
    total_beds = db.query(models.Bed).count()

    available_beds = db.query(models.Bed).filter(
        models.Bed.status == "Available"
    ).count()

    occupied_beds = db.query(models.Bed).filter(
        models.Bed.status == "Occupied"
    ).count()

    bookings = db.query(models.Booking).filter(
        models.Booking.active == True,
        models.Booking.deposit_received == True
    ).all()

    deposit_held = sum(
        booking.deposit or 0
        for booking in bookings
    )

    expected_income = sum(b.monthly_rent or 0 for b in bookings)

    paid_payments = db.query(models.Payment).filter(
        models.Payment.payment_status == "Paid"
    ).all()

    rent_income = sum(p.amount or 0 for p in paid_payments)

    maintenance_income = sum(p.maintenance_deduction or 0 for p in paid_payments)

    total_income = rent_income + maintenance_income

    expenses = db.query(models.Expense).all() if hasattr(models, "Expense") else []

    total_expenses = sum(e.amount or 0 for e in expenses)

    profit = total_income - total_expenses

    due_count = db.query(models.Payment).filter(
        models.Payment.payment_status == "Due"
    ).count()

    overdue_count = db.query(models.Payment).filter(
        models.Payment.payment_status == "Overdue"
    ).count()

    return {
        "total_pgs": total_pgs,
        "total_rooms": total_rooms,
        "total_beds": total_beds,
        "available_beds": available_beds,
        "occupied_beds": occupied_beds,
        "deposit_held": deposit_held,
        "expected_income": expected_income,
        "rent_income": rent_income,
        "maintenance_income": maintenance_income,
        "total_income": total_income,
        "expenses": total_expenses,
        "profit": profit,
        "due_count": due_count,
        "overdue_count": overdue_count
    }


# ---------------- Individual PG Dashboard ----------------

@router.get("/{pg_id}")
def pg_dashboard(pg_id: int, db: Session = Depends(get_db)):

    pg = db.query(models.PG).filter(
        models.PG.id == pg_id
    ).first()

    if not pg:
        return {"message": "PG not found"}

    rooms = db.query(models.Room).filter(
        models.Room.pg_id == pg_id
    ).all()

    room_ids = [room.id for room in rooms]

    beds = db.query(models.Bed).filter(
        models.Bed.room_id.in_(room_ids)
    ).all()

    bed_ids = [bed.id for bed in beds]

    total_rooms = len(rooms)
    total_beds = len(beds)

    available_beds = sum(
        1 for bed in beds if bed.status == "Available"
    )

    occupied_beds = sum(
        1 for bed in beds if bed.status == "Occupied"
    )

    # ---------------- Current Active Bookings ----------------

    active_bookings = db.query(models.Booking).filter(
        models.Booking.bed_id.in_(bed_ids),
        models.Booking.active == True
    ).all()

    deposit_held = sum(
        booking.deposit or 0
        for booking in active_bookings
        if booking.deposit_received
    )

    expected_income = sum(
        (booking.monthly_rent or 0) + (booking.food_charge or 0)
        for booking in active_bookings
    )

    # ---------------- ALL BOOKINGS OF THIS PG ----------------

    all_bookings = db.query(models.Booking).filter(
        models.Booking.bed_id.in_(bed_ids)
    ).all()

    booking_ids = [booking.id for booking in all_bookings]

    paid_payments = db.query(models.Payment).filter(
        models.Payment.booking_id.in_(booking_ids),
        models.Payment.payment_status == "Paid"
    ).all()

    rent_income = sum(
        payment.amount or 0
        for payment in paid_payments
    )

    food_income = sum(
        payment.food_charge or 0
        for payment in paid_payments
    )

    maintenance_income = sum(
        payment.maintenance_deduction or 0
        for payment in paid_payments
    )

    total_income = (
        rent_income +
        maintenance_income 
    )

    expenses = db.query(models.Expense).filter(
        models.Expense.pg_id == pg_id
    ).all()

    total_expenses = sum(
        expense.amount or 0
        for expense in expenses
    )

    profit = total_income - total_expenses

    due_count = db.query(models.Payment).filter(
        models.Payment.booking_id.in_(booking_ids),
        models.Payment.payment_status == "Due"
    ).count()

    overdue_count = db.query(models.Payment).filter(
        models.Payment.booking_id.in_(booking_ids),
        models.Payment.payment_status == "Overdue"
    ).count()

    return {
        "pg_name": pg.name,

        "total_rooms": total_rooms,
        "total_beds": total_beds,

        "available_beds": available_beds,
        "occupied_beds": occupied_beds,

        "deposit_held": deposit_held,
        "expected_income": expected_income,

        "rent_income": rent_income,
        "food_income": food_income,
        "maintenance_income": maintenance_income,

        "total_income": total_income,

        "expenses": total_expenses,
        "profit": profit,

        "due_count": due_count,
        "overdue_count": overdue_count
    }