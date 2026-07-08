from pydantic import BaseModel
from datetime import date


# ---------------- PG ----------------

class PGCreate(BaseModel):
    name: str
    address: str
    owner_name: str
    phone: str


class PGResponse(BaseModel):
    id: int
    name: str
    address: str
    owner_name: str
    phone: str

    class Config:
        from_attributes = True


# ---------------- Room ----------------

class RoomCreate(BaseModel):
    pg_id: int
    room_number: str
    floor: int
    capacity: int
    rent: int


class RoomResponse(BaseModel):
    id: int
    pg_id: int
    room_number: str
    floor: int
    capacity: int
    rent: int

    class Config:
        from_attributes = True


class RoomStatusUpdate(BaseModel):
    status: str


# ---------------- Booking ----------------

class BookingCreate(BaseModel):
    bed_id: int

    name: str
    phone: str
    email: str | None = None
    aadhaar: str | None = None

    move_in: date
    move_out: date | None = None

    deposit: int

    food: str
    guest_registration_no: str


class BookingResponse(BaseModel):
    booking_id: int
    tenant_name: str
    room_id: int
    status: str


class CheckoutRequest(BaseModel):
    bed_id: int
    maintenance_deduction: int
    move_out: date


# ---------------- Payment ----------------

class PaymentCreate(BaseModel):
    booking_id: int


class PaymentResponse(BaseModel):
    id: int
    booking_id: int

    month: str

    amount: int
    food_charge: int

    payment_status: str

    payment_date: date | None = None

    maintenance_deduction: int
    refund_amount: int | None = None

    class Config:
        from_attributes = True
    
from datetime import date


class ExpenseCreate(BaseModel):
    pg_id: int
    category: str
    amount: int
    date: date
    description: str | None = None

class PGExpenseCreate(BaseModel):
    category: str
    amount: int
    date: date
    description: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    pg_id: int
    category: str
    amount: int
    date: date
    description: str | None = None

    class Config:
        from_attributes = True   