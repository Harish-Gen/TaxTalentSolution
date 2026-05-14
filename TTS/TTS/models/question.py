from pydantic import BaseModel
from typing import Optional, List, Union, Dict, Any
from uuid import UUID
from datetime import datetime

class QuestionCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    qajson: Optional[Union[Dict[str, Any], List[Any], str]] = None
    isactive: Optional[bool] = None
    assessment_ids: Optional[List[UUID]] = None

class QuestionResponse(QuestionCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
    assessment_ids: List[UUID] = []
    assessments: Optional[List[dict]] = []
