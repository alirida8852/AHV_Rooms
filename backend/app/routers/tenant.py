from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models

router = APIRouter(
    prefix="/tenant",
    tags=["Tenant"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{tenant_id}")
def get_tenant_details(tenant_id: int, db: Session = Depends(get_db)):

    tenant = db.query(models.Tenant).filter(
        models.Tenant.id == tenant_id
    ).first()

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    booking = db.query(models.Booking).filter(
        models.Booking.tenant_id == tenant_id,
        models.Booking.active == True
    ).first()

    payments = []

    if booking:
        payments = db.query(models.Payment).filter(
            models.Payment.booking_id == booking.id
        ).all()

    payment_history = []

    for payment in payments:
        payment_history.append({
            "month": payment.month,
            "amount": payment.amount,
            "status": payment.payment_status,
            "payment_date": payment.payment_date
        })

    return {
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "phone": tenant.phone,
            "email": tenant.email,
            "aadhaar": tenant.aadhaar
        },
        "booking": None if booking is None else {
            "deposit": booking.deposit,
            "monthly_rent": booking.monthly_rent,
            "rent_due_day": booking.rent_due_day,
            "move_in": booking.move_in,
            "move_out": booking.move_out,
            "food": booking.food,
            "guest_registration_no": booking.guest_registration_no,
            "active": booking.active
        },
        "payments": payment_history
    }