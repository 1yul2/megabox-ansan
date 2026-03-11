from datetime import date
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.modules.auth.models import GenderEnum, PositionEnum


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    """직원 자가 회원가입 요청 (pending 상태로 생성)"""
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=4, max_length=255)
    name: str = Field(min_length=2, max_length=10)
    gender: GenderEnum
    birth_date: date
    ssn: Optional[str] = None
    phone: str = Field(min_length=9, max_length=20)
    email: EmailStr
    hire_date: Optional[date] = None
    health_cert_expire: Optional[date] = None
    unavailable_days: Optional[List[int]] = None


class RegisterResponse(BaseModel):
    message: str


class TokenResponse(BaseModel):
    is_system: bool
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    position: str
    is_active: bool

    class Config:
        from_attributes = True


class StaffResponse(BaseModel):
    id: int
    name: str
    position: PositionEnum

    class Config:
        from_attributes = True
