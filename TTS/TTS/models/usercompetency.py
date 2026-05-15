from pydantic import BaseModel
from typing import Optional, List, Union, Dict, Any
from uuid import UUID
from datetime import datetime

class UserCompetencyCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: UUID
    competenciesjson: Union[Dict[str, Any], List[Any], str]
    isactive: Optional[bool] = None

class UserCompetencyResponse(UserCompetencyCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
