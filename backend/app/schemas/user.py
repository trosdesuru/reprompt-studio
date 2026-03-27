# backend/app/schemas/user.py
from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    password: str
    invite_code: str