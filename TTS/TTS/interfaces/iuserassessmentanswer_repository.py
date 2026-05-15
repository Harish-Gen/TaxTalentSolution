from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.userassessmentanswer import UserAssessmentAnswerCreateUpdate, UserAssessmentAnswerResponse

class IUserAssessmentAnswerRepository(ABC):
    @abstractmethod
    def get_userassessmentanswer_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserAssessmentAnswerResponse]:
        pass

    @abstractmethod
    def get_all_userassessmentanswers(self) -> List[UserAssessmentAnswerResponse]:
        pass

    @abstractmethod
    def get_userassessmentanswers_by_userassessmentid(self, userassessmentid: UUID) -> List[UserAssessmentAnswerResponse]:
        pass

    @abstractmethod
    def upsert_userassessmentanswer(self, data: UserAssessmentAnswerCreateUpdate) -> UserAssessmentAnswerResponse:
        pass
