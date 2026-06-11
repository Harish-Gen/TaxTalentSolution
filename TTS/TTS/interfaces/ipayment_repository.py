from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.payment import PaymentCreateUpdate, PaymentResponse

class IPaymentRepository(ABC):
    @abstractmethod
    def create(self, payment: PaymentCreateUpdate) -> PaymentResponse:
        pass

    @abstractmethod
    def get_by_order_id(self, order_id: str) -> Optional[PaymentResponse]:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: UUID) -> List[PaymentResponse]:
        pass
