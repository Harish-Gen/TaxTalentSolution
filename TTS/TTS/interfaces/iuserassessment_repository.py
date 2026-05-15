from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.userassessment import UserAssessmentCreateUpdate, UserAssessmentResponse

class IUserAssessmentRepository(ABC):
    @abstractmethod
    def get_userassessment_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserAssessmentResponse]:
        pass

    @abstractmethod
    def get_all_userassessments(self) -> List[UserAssessmentResponse]:
        pass

    @abstractmethod
    def get_userassessments_by_user_id(self, userid: UUID) -> List[UserAssessmentResponse]:
        pass

    @abstractmethod
    def get_userassessments_by_assessment_id(self, assessmentid: UUID) -> List[UserAssessmentResponse]:
        pass

    @abstractmethod
    def upsert_userassessment(self, data: UserAssessmentCreateUpdate) -> UserAssessmentResponse:
        pass
