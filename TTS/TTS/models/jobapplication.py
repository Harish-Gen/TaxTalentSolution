from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class JobApplicationCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    jobpostingid: UUID
    candidateid: UUID
    userid: Optional[UUID] = None
    employerid: UUID
    coverletter: Optional[str] = None
    resumeurl: Optional[str] = None
    currentcompensation: Optional[float] = None
    expectedcompensation: Optional[float] = None
    status: Optional[str] = "submitted"
    stage: Optional[int] = 1
    progress: Optional[int] = 20
    notes: Optional[str] = None
    isactive: Optional[bool] = None


class JobApplicationResponse(JobApplicationCreateUpdate):
    id: UUID
    appliedat: Optional[datetime] = None
    reviewedat: Optional[datetime] = None
    reviewedby: Optional[UUID] = None
    rejectionreason: Optional[str] = None
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
