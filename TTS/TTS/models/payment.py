from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PaymentCreateUpdate(BaseModel):
    id: Optional[UUID] = None
    userid: UUID
    assessmentid: Optional[UUID] = None
    plan_name: Optional[str] = None
    amount: int  # in paise
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    status: str

class PaymentResponse(BaseModel):
    id: UUID
    userid: UUID
    assessmentid: Optional[UUID] = None
    plan_name: Optional[str] = None
    amount: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    status: str
    createdon: datetime
    isactive: bool
