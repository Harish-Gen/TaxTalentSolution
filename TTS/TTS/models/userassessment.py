from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserAssessmentCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: UUID
    assessmentid: UUID
    status: Optional[str] = "pending"
    startedon: Optional[datetime] = None
    completedon: Optional[datetime] = None
    score: Optional[float] = None
    isactive: Optional[bool] = None

class UserAssessmentResponse(UserAssessmentCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
