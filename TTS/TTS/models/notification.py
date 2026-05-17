from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class NotificationCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: UUID
    type: str
    title: str
    message: Optional[str] = None
    link: Optional[str] = None
    isread: Optional[bool] = False
    isactive: Optional[bool] = None


class NotificationResponse(NotificationCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
