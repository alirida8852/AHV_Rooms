from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
from app import models
from app.routers import pg
from app.routers import room
from app.routers import booking
from app.routers import dashboard
from app.routers import payment
from app.routers import expense
from app.routers import tenant
from app.routers import search
from app.routers import available
from app.routers import auth
from app.routers import rent
from app.routers import report


models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StaySync API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://laudable-compassion-production-d9b7.up.railway.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pg.router)
app.include_router(room.router)
app.include_router(booking.router)
app.include_router(dashboard.router)
app.include_router(payment.router)
app.include_router(expense.router)
app.include_router(tenant.router)
app.include_router(search.router)
app.include_router(available.router)            
app.include_router(auth.router)
app.include_router(rent.router)
app.include_router(report.router)

@app.get("/")
def home():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "message": "FastAPI is connected to PostgreSQL ✅"
        }

    except Exception as e:
        return {
            "error": str(e)
        }