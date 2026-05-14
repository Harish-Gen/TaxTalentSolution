from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.assessment import AssessmentCreateUpdate, AssessmentResponse

class IAssessmentRepository(ABC):
    @abstractmethod
    def get_assessment_by_id(self, assessment_id: UUID, include_inactive: bool = False) -> Optional[AssessmentResponse]:
        pass

    @abstractmethod
    def get_all_assessments(self) -> List[AssessmentResponse]:
        pass

    @abstractmethod
    def upsert_assessment(self, assessment: AssessmentCreateUpdate) -> AssessmentResponse:
        pass
