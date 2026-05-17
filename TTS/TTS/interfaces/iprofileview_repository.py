from abc import ABC, abstractmethod
from typing import List, Dict
from uuid import UUID
from models.profileview import ProfileViewCreate, ProfileViewResponse


class IProfileViewRepository(ABC):
    @abstractmethod
    def record(self, view: ProfileViewCreate) -> ProfileViewResponse:
        pass

    @abstractmethod
    def get_counts_by_candidate_ids(self, candidate_ids: List[UUID]) -> Dict[str, int]:
        pass

    @abstractmethod
    def get_by_employer_id(self, employerid: UUID) -> List[ProfileViewResponse]:
        pass
