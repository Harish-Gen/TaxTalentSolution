from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.employer import EmployerCreateUpdate, EmployerResponse

class IEmployerRepository(ABC):
    @abstractmethod
    def get_employer_by_id(self, employer_id: UUID, include_inactive: bool = False) -> Optional[EmployerResponse]:
        pass

    @abstractmethod
    def get_all_employers(self) -> List[EmployerResponse]:
        pass

    @abstractmethod
    def upsert_employer(self, employer: EmployerCreateUpdate) -> EmployerResponse:
        pass
