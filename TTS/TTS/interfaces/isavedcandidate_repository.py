from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.savedcandidate import SavedCandidateCreateUpdate, SavedCandidateResponse


class ISavedCandidateRepository(ABC):
    @abstractmethod
    def get_by_employer_id(self, employerid: UUID) -> List[SavedCandidateResponse]:
        pass

    @abstractmethod
    def get_by_employer_and_candidate(
        self, employerid: UUID, candidateid: UUID
    ) -> Optional[SavedCandidateResponse]:
        pass

    @abstractmethod
    def upsert(self, row: SavedCandidateCreateUpdate) -> SavedCandidateResponse:
        pass
