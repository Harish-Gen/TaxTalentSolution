from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.jobposting import JobPostingCreateUpdate, JobPostingResponse

class IJobPostingRepository(ABC):
    @abstractmethod
    def get_jobposting_by_id(self, jobposting_id: UUID, include_inactive: bool = False) -> Optional[JobPostingResponse]:
        pass

    @abstractmethod
    def get_all_jobpostings(self) -> List[JobPostingResponse]:
        pass

    @abstractmethod
    def upsert_jobposting(self, jobposting: JobPostingCreateUpdate) -> JobPostingResponse:
        pass
