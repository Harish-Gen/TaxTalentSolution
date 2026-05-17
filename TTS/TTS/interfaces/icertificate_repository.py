from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.certificate import CertificateCreateUpdate, CertificateResponse


class ICertificateRepository(ABC):
    @abstractmethod
    def get_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[CertificateResponse]:
        pass

    @abstractmethod
    def get_by_candidate_id(self, candidateid: UUID) -> List[CertificateResponse]:
        pass

    @abstractmethod
    def get_by_user_id(self, userid: UUID) -> List[CertificateResponse]:
        pass

    @abstractmethod
    def upsert(self, data: CertificateCreateUpdate) -> CertificateResponse:
        pass
