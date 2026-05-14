from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UserCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    roleid: Optional[UUID] = None
    isactive: Optional[bool] = None
    employer_ids: Optional[List[UUID]] = None

class UserResponse(UserCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    employer_ids: List[UUID] = []
    role: Optional[dict] = None
    employers: Optional[List[dict]] = []
