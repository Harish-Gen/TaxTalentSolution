from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import Field

class EmployerCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: Optional[UUID] = None
    name: Optional[str] = None
    contactperson: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    industry: Optional[str] = None
    companysize: Optional[str] = None
    website: Optional[str] = None
    isactive: Optional[bool] = None

class EmployerResponse(EmployerCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    user: Optional[dict] = None

    # Exclude these from response since they are in the user object
    name: Optional[str] = Field(default=None, exclude=True)
    email: Optional[EmailStr] = Field(default=None, exclude=True)
    phone: Optional[str] = Field(default=None, exclude=True)
