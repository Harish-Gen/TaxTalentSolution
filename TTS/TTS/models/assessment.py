from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class AssessmentCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    title: Optional[str] = None
    category: Optional[str] = None
    difficultylevel: Optional[str] = None
    numberofquestions: Optional[int] = None
    durationminutes: Optional[int] = None
    passingscore: Optional[float] = None
    pointsperquestion: Optional[float] = None
    description: Optional[str] = None
    status: Optional[str] = None
    isactive: Optional[bool] = None

class AssessmentResponse(AssessmentCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
