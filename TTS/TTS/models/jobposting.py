from pydantic import BaseModel
from typing import Optional, Union, List
from uuid import UUID
from datetime import datetime, date

class JobPostingCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    jobtitle: Optional[str] = None
    employerid: Optional[UUID] = None
    location: Optional[str] = None
    jobtype: Optional[str] = None
    experiencelevel: Optional[str] = None
    category: Optional[str] = None
    minsalary: Optional[float] = None
    maxsalary: Optional[float] = None
    closingdate: Optional[date] = None
    jobdescription: Optional[str] = None
    requirements: Optional[Union[List[str], str]] = None
    responsibilities: Optional[Union[List[str], str]] = None
    benefits: Optional[Union[List[str], str]] = None
    isactive: Optional[bool] = None

class JobPostingResponse(JobPostingCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
