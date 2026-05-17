from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SavedCandidateCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    employerid: UUID
    candidateid: UUID
    savedby: Optional[UUID] = None
    folder: Optional[str] = None
    notes: Optional[str] = None
    isactive: Optional[bool] = True


class SavedCandidateResponse(SavedCandidateCreateUpdate):
    id: UUID
    savedat: Optional[datetime] = None
