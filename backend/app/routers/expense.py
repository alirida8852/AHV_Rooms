from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models, schemas

router = APIRouter(
    prefix="/expense",
    tags=["Expense"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- ALL EXPENSES ----------------

@router.get("/")
def get_all_expenses(db: Session = Depends(get_db)):
    return db.query(models.Expense).all()


# ---------------- SINGLE PG EXPENSES ----------------

@router.get("/pg/{pg_id}")
def get_pg_expenses(
    pg_id: int,
    db: Session = Depends(get_db)
):

    expenses = (
        db.query(models.Expense)
        .filter(models.Expense.pg_id == pg_id)
        .order_by(models.Expense.date.desc())
        .all()
    )

    total = sum(exp.amount for exp in expenses)

    return {
        "total": total,
        "expenses": expenses
    }


# ====================================================
# ADD EXPENSE FROM SIDEBAR
# POST /expense/
# ====================================================

@router.post("/")
def add_expense(
    data: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):

    expense = models.Expense(
        pg_id=data.pg_id,
        category=data.category,
        amount=data.amount,
        description=data.description,
        date=data.date
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


# ====================================================
# ADD EXPENSE FROM INSIDE PG
# POST /expense/pg/{pg_id}
# ====================================================

@router.post("/pg/{pg_id}")
def add_pg_expense(
    pg_id: int,
    data: schemas.PGExpenseCreate,
    db: Session = Depends(get_db)
):

    expense = models.Expense(
        pg_id=pg_id,
        category=data.category,
        amount=data.amount,
        description=data.description,
        date=data.date
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


# ---------------- EDIT EXPENSE ----------------

@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    data: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):

    expense = (
        db.query(models.Expense)
        .filter(models.Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    expense.pg_id = data.pg_id
    expense.category = data.category
    expense.amount = data.amount
    expense.description = data.description
    expense.date = data.date

    db.commit()
    db.refresh(expense)

    return expense


# ---------------- DELETE EXPENSE ----------------

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):

    expense = (
        db.query(models.Expense)
        .filter(models.Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }