from pydantic import BaseModel, EmailStr
from typing import Optional, Union, Dict, List
from uuid import UUID
from datetime import datetime

class CandidateCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: Optional[UUID] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[Union[Dict, str]] = None
    locationcity: Optional[str] = None
    locationstate: Optional[str] = None
    locationcountry: Optional[str] = None
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
    linkedinurl: Optional[str] = None
    experience: Optional[Union[List[dict], str]] = None
    education: Optional[Union[List[dict], str]] = None


from pydantic import Field

class CandidateResponse(CandidateCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    user: Optional[dict] = None

    # Exclude these from the response since they are nested in the user object
    name: Optional[str] = Field(default=None, exclude=True)
    email: Optional[EmailStr] = Field(default=None, exclude=True)
    phone: Optional[str] = Field(default=None, exclude=True)
