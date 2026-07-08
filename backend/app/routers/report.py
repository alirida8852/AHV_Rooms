from io import BytesIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook
from fastapi.responses import JSONResponse
from app.database import SessionLocal
from app import models


router = APIRouter(
    prefix="/report",
    tags=["Reports"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/excel")
def export_excel(db: Session = Depends(get_db)):

    workbook = Workbook()
    workbook.remove(workbook.active)

    pgs = db.query(models.PG).all()

    for pg in pgs:

        sheet = workbook.create_sheet(title=pg.name[:31])

        # ---------------- PG DETAILS ----------------

        sheet.append(["PG DETAILS"])
        sheet.append(["PG Name", pg.name])
        sheet.append(["Address", pg.address])
        sheet.append(["Owner", pg.owner_name])
        sheet.append(["Phone", pg.phone])
        sheet.append([])

        # ---------------- DASHBOARD SUMMARY ----------------

        rooms = db.query(models.Room).filter(
            models.Room.pg_id == pg.id
        ).all()

        room_ids = [room.id for room in rooms]

        beds = db.query(models.Bed).filter(
            models.Bed.room_id.in_(room_ids)
        ).all()

        bed_ids = [bed.id for bed in beds]

        total_rooms = len(rooms)
        total_beds = len(beds)

        available_beds = sum(
            1 for bed in beds
            if bed.status == "Available"
        )

        occupied_beds = total_beds - available_beds

        bookings = db.query(models.Booking).filter(
            models.Booking.bed_id.in_(bed_ids)
        ).all()

        booking_ids = [booking.id for booking in bookings]

        deposit_held = sum(
            booking.deposit
            for booking in bookings
            if booking.active
        )

        expected_income = sum(
            booking.monthly_rent + booking.food_charge
            for booking in bookings
            if booking.active
        )

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
            for payment in db.query(models.Payment).filter(
                models.Payment.booking_id.in_(booking_ids),
                models.Payment.payment_status == "Checkout"
            ).all()
        )

        total_income = (
            rent_income +
            food_income +
            maintenance_income
        )

        expenses = db.query(models.Expense).filter(
            models.Expense.pg_id == pg.id
        ).all()

        total_expenses = sum(
            expense.amount
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

        sheet.append(["DASHBOARD SUMMARY"])
        sheet.append(["Total Rooms", total_rooms])
        sheet.append(["Total Beds", total_beds])
        sheet.append(["Available Beds", available_beds])
        sheet.append(["Occupied Beds", occupied_beds])
        sheet.append(["Deposit Held", deposit_held])
        sheet.append(["Expected Income", expected_income])
        sheet.append(["Rent Income", rent_income])
        sheet.append(["Food Income", food_income])
        sheet.append(["Maintenance Income", maintenance_income])
        sheet.append(["Total Income", total_income])
        sheet.append(["Expenses", total_expenses])
        sheet.append(["Profit", profit])
        sheet.append(["Due Payments", due_count])
        sheet.append(["Overdue Payments", overdue_count])
        sheet.append([])

        # ---------------- EXPENSES ----------------

        sheet.append(["EXPENSES"])

        sheet.append([
            "Date",
            "Category",
            "Description",
            "Amount"
        ])

        if expenses:

            for expense in expenses:

                sheet.append([
                    expense.date,
                    expense.category,
                    expense.description,
                    expense.amount
                ])

        else:

            sheet.append([
                "-",
                "-",
                "No Expenses",
                "-"
            ])

        sheet.append([])
        sheet.append([])

        # ---------------- ROOMS & TENANTS ----------------

        sheet.append(["ROOMS & TENANTS"])

        sheet.append([
            "Room",
            "Bed",
            "Tenant",
            "Phone",
            "Monthly Rent",
            "Food",
            "Deposit",
            "Status"
        ])

        for room in rooms:

            beds = db.query(models.Bed).filter(
                models.Bed.room_id == room.id
            ).all()

            for bed in beds:

                booking = db.query(models.Booking).filter(
                    models.Booking.bed_id == bed.id,
                    models.Booking.active == True
                ).first()

                if booking:

                    tenant = db.query(models.Tenant).filter(
                        models.Tenant.id == booking.tenant_id
                    ).first()

                    sheet.append([
                        room.room_number,
                        bed.bed_number,
                        tenant.name,
                        tenant.phone,
                        booking.monthly_rent,
                        booking.food,
                        booking.deposit,
                        "Occupied"
                    ])

                else:

                    sheet.append([
                        room.room_number,
                        bed.bed_number,
                        "",
                        "",
                        room.rent,
                        "",
                        "",
                        "Available"
                    ])

    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition":
            "attachment; filename=PG_Report.xlsx"
        }
    )

@router.get("/live")
def live_report(db: Session = Depends(get_db)):

    pgs = db.query(models.PG).all()

    result = []

    for pg in pgs:

        rooms = db.query(models.Room).filter(
            models.Room.pg_id == pg.id
        ).all()

        total_rooms = len(rooms)

        room_ids = [room.id for room in rooms]

        beds = db.query(models.Bed).filter(
            models.Bed.room_id.in_(room_ids)
        ).all()

        total_beds = len(beds)

        available_beds = sum(
            1 for bed in beds
            if bed.status == "Available"
        )

        occupied_beds = total_beds - available_beds

        bookings = db.query(models.Booking).filter(
            models.Booking.bed_id.in_([bed.id for bed in beds])
        ).all()

        booking_ids = [booking.id for booking in bookings]

        deposit_held = sum(
            booking.deposit or 0
            for booking in bookings
            if booking.active
        )

        expected_income = sum(
            (booking.monthly_rent or 0) +
            (booking.food_charge or 0)
            for booking in bookings
            if booking.active
        )

        paid_payments = db.query(models.Payment).filter(
            models.Payment.booking_id.in_(booking_ids),
            models.Payment.payment_status == "Paid"
        ).all()

        checkout_payments = db.query(models.Payment).filter(
            models.Payment.booking_id.in_(booking_ids),
            models.Payment.payment_status == "Checkout"
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
            for payment in checkout_payments
        )

        total_income = (
            rent_income +
            food_income +
            maintenance_income
        )

        expenses = db.query(models.Expense).filter(
            models.Expense.pg_id == pg.id
        ).all()

        total_expenses = sum(
            expense.amount or 0
            for expense in expenses
        )

        profit = total_income - total_expenses

        result.append({
            "id": pg.id,
            "name": pg.name,
            "address": pg.address,
            "owner": pg.owner_name,
            "phone": pg.phone,

            "dashboard": {
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

            },

            "expense_list": [
                {
                    "date": expense.date,
                    "category": expense.category,
                    "description": expense.description,
                    "amount": expense.amount
                }
                for expense in expenses
            ]
        })

    return result