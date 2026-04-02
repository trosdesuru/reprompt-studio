# backend/app/schemas/user.py
from pydantic import BaseModel


class UserRegister(BaseModel):
    username: str
    password: str
    invite_code: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class GoogleAuthRequest(BaseModel):
    token: str


class GoogleJoinRequest(BaseModel):
    token: str
    invite_code: str
    username: str
