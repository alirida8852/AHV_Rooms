from sqlalchemy import Column, Integer, String, ForeignKey, Date, Boolean, Float
from app.database import Base
from datetime import date


# ---------------- PG ----------------

class PG(Base):
    __tablename__ = "pgs"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)


# ---------------- Room ----------------

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)

    pg_id = Column(
        Integer,
        ForeignKey("pgs.id", ondelete="CASCADE")
    )

    room_number = Column(String, nullable=False)
    floor = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    rent = Column(Integer, nullable=False)

    status = Column(String, default="Available")


# ---------------- Bed ----------------

class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(
        Integer,
        ForeignKey("rooms.id", ondelete="CASCADE")
    )

    bed_number = Column(String, nullable=False)
    status = Column(String, default="Available")


# ---------------- Tenant ----------------

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String)
    aadhaar = Column(String)


# ---------------- Booking ----------------

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE")
    )

    bed_id = Column(
        Integer,
        ForeignKey("beds.id", ondelete="CASCADE")
    )

    move_in = Column(Date, nullable=False)
    move_out = Column(Date)

    deposit = Column(Integer, nullable=False)

    # Deposit counted only after first payment
    deposit_received = Column(Boolean, default=False)

    monthly_rent = Column(Integer, nullable=False)

    rent_due_day = Column(Integer, nullable=False)

    food = Column(String)

    food_charge = Column(Integer, default=3000)

    guest_registration_no = Column(String)

    active = Column(Boolean, default=True)


# ---------------- Payment ----------------

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id", ondelete="CASCADE")
    )

    month = Column(String, nullable=False)

    amount = Column(Integer, nullable=False)

    food_charge = Column(Integer, default=0)

    payment_status = Column(String, default="Pending")

    payment_date = Column(Date)

    maintenance_deduction = Column(Integer, default=0)

    refund_amount = Column(Integer, default=0)


# ---------------- Expense ----------------

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    pg_id = Column(
        Integer,
        ForeignKey("pgs.id", ondelete="CASCADE"),
        nullable=True
    )

    amount = Column(Float, default=0)

    description = Column(String, nullable=True)

    category = Column(String, nullable=True)

    date = Column(Date, default=date.today)