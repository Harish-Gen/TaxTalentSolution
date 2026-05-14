from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class EmployerCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    companyname: Optional[str] = None
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
