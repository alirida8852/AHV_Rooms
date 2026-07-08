from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas

router = APIRouter(prefix="/room", tags=["Room"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):

    new_room = models.Room(
        pg_id=room.pg_id,
        room_number=room.room_number,
        floor=room.floor,
        capacity=room.capacity,
        rent=room.rent
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    # Automatically create beds
    for i in range(room.capacity):
        new_bed = models.Bed(
            room_id=new_room.id,
            bed_number=chr(65 + i),   # A, B, C...
            status="Available"
        )
        db.add(new_bed)

    db.commit()

    return new_room


@router.get("/{pg_id}", response_model=list[schemas.RoomResponse])
def get_rooms_by_pg(pg_id: int, db: Session = Depends(get_db)):
    rooms = (
        db.query(models.Room)
    .   filter(models.Room.pg_id == pg_id)
    .   order_by(models.Room.room_number)
    .   all()
     )

    return rooms


@router.patch("/{room_id}/status")
def update_room_status(
    room_id: int,
    data: schemas.RoomStatusUpdate,
    db: Session = Depends(get_db)
):

    room = db.query(models.Room).filter(
        models.Room.id == room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    room.status = data.status

    db.commit()

    return {
        "message": "Room status updated"
    }


@router.get("/details/{room_id}")
def room_details(room_id: int, db: Session = Depends(get_db)):

    room = db.query(models.Room).filter(
        models.Room.id == room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    beds = db.query(models.Bed).filter(
        models.Bed.room_id == room_id
    ).all()

    bed_details = []

    for bed in beds:

        booking = db.query(models.Booking).filter(
            models.Booking.bed_id == bed.id,
            models.Booking.active == True
        ).first()

        if booking:

            tenant = db.query(models.Tenant).filter(
                models.Tenant.id == booking.tenant_id
            ).first()

            bed_details.append({
                "bed_number": bed.bed_number,
                "status": bed.status,
                "tenant": tenant.name,
                "phone": tenant.phone
            })

        else:

            bed_details.append({
                "bed_number": bed.bed_number,
                "status": bed.status,
                "tenant": None,
                "phone": None
            })

    return {
        "room_number": room.room_number,
        "capacity": room.capacity,
        "rent": room.rent,
        "beds": bed_details
    }
@router.get("/{room_id}/beds")
def get_room_beds(room_id: int, db: Session = Depends(get_db)):

    room = db.query(models.Room).filter(
        models.Room.id == room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    beds = db.query(models.Bed).filter(
        models.Bed.room_id == room_id
    ).all()

    result = []

    for bed in beds:

        booking = db.query(models.Booking).filter(
            models.Booking.bed_id == bed.id,
            models.Booking.active == True
        ).first()

        tenant_name = None

        if booking:
            tenant = db.query(models.Tenant).filter(
                models.Tenant.id == booking.tenant_id
            ).first()

            if tenant:
                tenant_name = tenant.name

        result.append({
            "bed_id": bed.id,
            "bed_number": bed.bed_number,
            "status": bed.status,
            "tenant": tenant_name
        })

    return {
        "room_number": room.room_number,
        "capacity": room.capacity,
        "beds": result
    }

@router.put("/{room_id}")
def update_room(room_id: int, data: schemas.RoomCreate, db: Session = Depends(get_db)):

    room = db.query(models.Room).filter(models.Room.id == room_id).first()

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.room_number = data.room_number
    room.floor = data.floor
    room.capacity = data.capacity
    room.rent = data.rent

    db.commit()
    db.refresh(room)

    return room

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):

    room = db.query(models.Room).filter(
        models.Room.id == room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    beds = db.query(models.Bed).filter(
        models.Bed.room_id == room_id
    ).all()

    # Don't allow deleting occupied rooms
    for bed in beds:
        active_booking = db.query(models.Booking).filter(
            models.Booking.bed_id == bed.id,
            models.Booking.active == True
        ).first()

        if active_booking:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete room with active tenants"
            )

    # Delete old bookings/payments/tenants
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

    db.commit()

    return {
        "message": "Room deleted successfully"
    }

@router.get("/{room_id}/details")
def get_room_details(room_id: int, db: Session = Depends(get_db)):

    room = db.query(models.Room).filter(
        models.Room.id == room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    beds = db.query(models.Bed).filter(
        models.Bed.room_id == room_id
    ).all()

    bed_details = []

    for bed in beds:

        booking = db.query(models.Booking).filter(
            models.Booking.bed_id == bed.id,
            models.Booking.active == True
        ).first()

        tenant_data = None

        if booking:

            tenant = db.query(models.Tenant).filter(
                models.Tenant.id == booking.tenant_id
            ).first()

            if tenant:

                payments = db.query(models.Payment).filter(
                    models.Payment.booking_id == booking.id
                ).all()

                tenant_data = {
                    "id": tenant.id,
                    "name": tenant.name,
                    "phone": tenant.phone,
                    "email": tenant.email,
                    "aadhaar": tenant.aadhaar,
                    "deposit": booking.deposit,
                    "monthly_rent": booking.monthly_rent,
                    "rent_due_day": booking.rent_due_day,
                    "move_in": booking.move_in,
                    "move_out": booking.move_out,
                    "food": booking.food,
                    "guest_registration_no": booking.guest_registration_no,
                    "active": booking.active,
                    "payments": [
                        {
                            "id": payment.id,
                            "month": payment.month,
                            "amount": payment.amount,
                            "food_charge": payment.food_charge,
                            "status": payment.payment_status,
                            "payment_date": payment.payment_date
                        }
                        for payment in payments
                    ]
                }

        bed_details.append({
            "bed_id": bed.id,
            "bed_number": bed.bed_number,
            "status": bed.status,
            "tenant": tenant_data
        })

    return {
        "room_id": room.id,
        "pg_id": room.pg_id,
        "room_number": room.room_number,
        "floor": room.floor,
        "capacity": room.capacity,
        "rent": room.rent,
        "beds": bed_details
    }