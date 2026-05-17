from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.jobapplication import JobApplicationCreateUpdate, JobApplicationResponse


class IJobApplicationRepository(ABC):
    @abstractmethod
    def get_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[JobApplicationResponse]:
        pass

    @abstractmethod
    def get_all(self) -> List[JobApplicationResponse]:
        pass

    @abstractmethod
    def get_by_candidate_id(self, candidateid: UUID) -> List[JobApplicationResponse]:
        pass

    @abstractmethod
    def get_by_user_id(self, userid: UUID) -> List[JobApplicationResponse]:
        pass

    @abstractmethod
    def get_by_employer_id(self, employerid: UUID) -> List[JobApplicationResponse]:
        pass

    @abstractmethod
    def get_by_job_and_candidate(
        self, jobpostingid: UUID, candidateid: UUID
    ) -> Optional[JobApplicationResponse]:
        pass

    @abstractmethod
    def upsert(self, data: JobApplicationCreateUpdate) -> JobApplicationResponse:
        pass
