# backend/app/models/user.py
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class InviteCode(SQLModel, table=True):
    """Tabla para almacenar los códigos de invitación de un solo uso"""
    id: Optional[int] = Field(default=None, primary_key=True)
    code: str = Field(index=True, unique=True, nullable=False)
    is_used: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_by_id: Optional[int] = Field(default=None, foreign_key="user.id")

class User(SQLModel, table=True):
    """Tabla de Usuarios con sistema de Roles (RBAC)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    
    # Roles: "voyager" (Lector), "artist" (Creador), "admin" (Dueño)
    role: str = Field(default="voyager") 
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)