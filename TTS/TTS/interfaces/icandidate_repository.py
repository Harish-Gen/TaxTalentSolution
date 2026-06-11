from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.candidate import CandidateCreateUpdate, CandidateResponse

class ICandidateRepository(ABC):
    @abstractmethod
    def get_candidate_by_id(self, candidate_id: UUID, include_inactive: bool = False) -> Optional[CandidateResponse]:
        pass

    @abstractmethod
    def get_all_candidates(self) -> List[CandidateResponse]:
        pass

    @abstractmethod
    def get_candidate_by_user_id(self, userid: UUID) -> Optional[CandidateResponse]:
        pass

    @abstractmethod
    def ensure_candidate_for_user(self, userid: UUID) -> CandidateResponse:
        pass

    @abstractmethod
    def upsert_candidate(self, candidate: CandidateCreateUpdate) -> CandidateResponse:
        pass

    @abstractmethod
    def get_candidate_by_linkedin_url(self, url: str) -> Optional[CandidateResponse]:
        pass

