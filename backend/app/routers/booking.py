from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas

router = APIRouter(prefix="/booking", tags=["Booking"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- ASSIGN TENANT ----------------

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db)
):

    bed = db.query(models.Bed).filter(
        models.Bed.id == data.bed_id
    ).first()

    if not bed:
        raise HTTPException(
            status_code=404,
            detail="Bed not found"
        )

    if bed.status == "Occupied":
        raise HTTPException(
            status_code=400,
            detail="Bed already occupied"
        )

    room = db.query(models.Room).filter(
        models.Room.id == bed.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # Create Tenant
    tenant = models.Tenant(
        name=data.name,
        phone=data.phone,
        email=data.email,
        aadhaar=data.aadhaar
    )

    db.add(tenant)
    db.flush()

    # Create Booking
    booking = models.Booking(
        tenant_id=tenant.id,
        bed_id=bed.id,
        move_in=data.move_in,
        move_out=data.move_out,
        deposit=data.deposit,
        monthly_rent=room.rent,
        rent_due_day=data.move_in.day,
        food=data.food,
        food_charge=3000 if data.food == "Yes" else 0,
        guest_registration_no=data.guest_registration_no,
        active=True
    )

    db.add(booking)
    db.flush()

    # Occupy Bed
    bed.status = "Occupied"

    # First Payment
    payment = models.Payment(
        booking_id=booking.id,
        month=data.move_in.strftime("%B %Y"),
        amount=booking.monthly_rent,
        food_charge=booking.food_charge,
        payment_status="Pending",
        payment_date=None,
        maintenance_deduction=0,
        refund_amount=0
    )

    db.add(payment)

    db.commit()

    db.refresh(booking)

    return {
        "booking_id": booking.id,
        "tenant_name": tenant.name,
        "room_id": room.id,
        "status": "Occupied"
    }


# ---------------- CHECKOUT ----------------

@router.post("/checkout")
def checkout(
    data: schemas.CheckoutRequest,
    db: Session = Depends(get_db)
):

    booking = db.query(models.Booking).filter(
        models.Booking.bed_id == data.bed_id,
        models.Booking.active == True
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="No active booking found"
        )

    bed = db.query(models.Bed).filter(
        models.Bed.id == data.bed_id
    ).first()

    if not bed:
        raise HTTPException(
            status_code=404,
            detail="Bed not found"
        )

    refund_amount = booking.deposit - data.maintenance_deduction

    if refund_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Maintenance deduction cannot exceed deposit"
        )

    # Close booking
    booking.move_out = data.move_out
    booking.active = False

    # Free bed
    bed.status = "Available"

    # Record maintenance income
    checkout_payment = models.Payment(
        booking_id=booking.id,
        month="Checkout",
        amount=0,
        food_charge=0,
        payment_status="Paid",          # IMPORTANT
        payment_date=data.move_out,
        maintenance_deduction=data.maintenance_deduction,
        refund_amount=refund_amount
    )

    db.add(checkout_payment)

    db.commit()

    return {
        "message": "Checkout successful",
        "deposit": booking.deposit,
        "maintenance_deduction": data.maintenance_deduction,
        "refund_amount": refund_amount
    }