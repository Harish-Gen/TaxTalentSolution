from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class AdminUserResponse(BaseModel):
    id: UUID
    userid: UUID
    role: str
    permissions: Optional[str] = None
    assignedemployers: Optional[str] = None
    status: str
    lastlogin: Optional[datetime] = None
    isactive: bool
    createdon: Optional[datetime] = None
