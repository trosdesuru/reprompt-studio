from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    invite_code: str


class UserLogin(BaseModel):
    username: str
    password: str


class UsernameUpdate(BaseModel):
    new_username: str


class Token(BaseModel):
    access_token: str
    token_type: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str


class GoogleJoinRequest(BaseModel):
    token: str
    invite_code: str
    username: str


class DiscordAuthRequest(BaseModel):
    code: str
    redirect_uri: str
