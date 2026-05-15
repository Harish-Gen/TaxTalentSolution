from pydantic import BaseModel
from typing import Optional, List, Union, Dict, Any
from uuid import UUID
from datetime import datetime

class UserAssessmentAnswerCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userassessmentid: UUID
    answersjson: Union[Dict[str, Any], List[Any], str]
    isactive: Optional[bool] = None

class UserAssessmentAnswerResponse(UserAssessmentAnswerCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
