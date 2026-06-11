from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
import razorpay
from interfaces.ipayment_repository import IPaymentRepository
from repository.payment_repository import PaymentRepository
from models.payment import PaymentCreateUpdate, PaymentResponse
from config.settings import settings

router = APIRouter(
    prefix="/api/payment",
    tags=["Payment"]
)

# Dependency injection for the repository
def get_payment_repository() -> IPaymentRepository:
    return PaymentRepository()

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

class CreateOrderRequest(BaseModel):
    amount: int  # in rupees (we convert to paise here)
    currency: str = "INR"
    receipt: Optional[str] = None
    assessmentid: Optional[UUID] = None
    plan_name: Optional[str] = None

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    userid: UUID
    assessmentid: Optional[UUID] = None
    plan_name: Optional[str] = None
    amount: int # in paise

@router.post("/create-order", response_model=CreateOrderResponse)
def create_order(request: CreateOrderRequest):
    try:
        # Amount in Razorpay is in paise (1 INR = 100 paise)
        amount_in_paise = request.amount * 100
        receipt_id = request.receipt or f"rcpt_{request.assessmentid or request.plan_name or 'generic'}"
        
        order_data = {
            "amount": amount_in_paise,
            "currency": request.currency,
            "receipt": receipt_id[:40] if receipt_id else "generic_receipt",
            "payment_capture": 1 # Auto capture payment
        }
        order = razorpay_client.order.create(data=order_data)
        return CreateOrderResponse(
            order_id=order["id"],
            amount=order["amount"],
            currency=order["currency"],
            key_id=settings.razorpay_key_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay Order creation failed: {str(e)}")

@router.post("/verify-signature", response_model=PaymentResponse)
def verify_signature(
    request: VerifyPaymentRequest, 
    repo: IPaymentRepository = Depends(get_payment_repository)
):
    try:
        # Verification using Razorpay SDK
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        # This will raise an exception if verification fails
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Insert payment record to database table
        payment_record = PaymentCreateUpdate(
            userid=request.userid,
            assessmentid=request.assessmentid,
            plan_name=request.plan_name,
            amount=request.amount,
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature,
            status="success"
        )
        return repo.create(payment_record)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signature verification / DB save failed: {str(e)}")

@router.get("/user/{user_id}", response_model=List[PaymentResponse])
def get_user_payments(user_id: UUID, repo: IPaymentRepository = Depends(get_payment_repository)):
    try:
        return repo.get_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
