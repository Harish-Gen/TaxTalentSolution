from pydantic import BaseModel
from typing import Optional, Union, List
from uuid import UUID
from datetime import datetime, date


class CertificateCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    candidateid: UUID
    userid: Optional[UUID] = None
    assessmentid: Optional[UUID] = None
    credentialid: str
    title: str
    score: Optional[int] = None
    percentile: Optional[int] = None
    level: Optional[str] = None
    issuedate: date
    expirydate: Optional[date] = None
    skillsvalidated: Optional[Union[List[str], str]] = None
    isvalid: Optional[bool] = True
    pdfurl: Optional[str] = None
    isactive: Optional[bool] = None


class CertificateResponse(CertificateCreateUpdate):
    id: UUID
    createdon: Optional[datetime] = None
    createdby: Optional[str] = None
    modifiedon: Optional[datetime] = None
    modifiedby: Optional[str] = None
