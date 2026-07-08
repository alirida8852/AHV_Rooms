from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Change this later when deploying
APP_PASSWORD = "2104"


class LoginRequest(BaseModel):
    password: str


@router.post("/login")
def login(data: LoginRequest):

    if data.password != APP_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )

    return {
        "message": "Login Successful"
    }