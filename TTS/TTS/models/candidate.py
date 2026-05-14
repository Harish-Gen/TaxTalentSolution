from pydantic import BaseModel, EmailStr
from typing import Optional, Union, Dict, List
from uuid import UUID
from datetime import datetime

class CandidateCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[Union[Dict, str]] = None
    currenttitle: Optional[str] = None
    experienceyrs: Optional[float] = None
    noticeperiod: Optional[int] = None
    taxexpertise: Optional[Union[List[str], str]] = None
    certifications: Optional[Union[List[str], str]] = None
    hourlyrate: Optional[float] = None
    currency: Optional[str] = None
    availability: Optional[str] = None
    workmode: Optional[str] = None
    resumeurl: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[str] = None
    isactive: Optional[bool] = None

class CandidateResponse(CandidateCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
