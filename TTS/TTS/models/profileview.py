from pydantic import BaseModel
from typing import Optional, Dict
from uuid import UUID
from datetime import datetime


class ProfileViewCreate(BaseModel):
    candidateid: UUID
    employerid: Optional[UUID] = None
    vieweruserid: Optional[UUID] = None
    viewtype: Optional[str] = "full"
    source: Optional[str] = "employer_portal"


class ProfileViewResponse(ProfileViewCreate):
    id: UUID
    viewedat: Optional[datetime] = None


class ProfileViewCountResponse(BaseModel):
    candidateid: UUID
    viewcount: int
