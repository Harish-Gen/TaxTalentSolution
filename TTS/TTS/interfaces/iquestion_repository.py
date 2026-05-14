from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.question import QuestionCreateUpdate, QuestionResponse

class IQuestionRepository(ABC):
    @abstractmethod
    def get_question_by_id(self, question_id: UUID, include_inactive: bool = False) -> Optional[QuestionResponse]:
        pass

    @abstractmethod
    def get_all_questions(self) -> List[QuestionResponse]:
        pass

    @abstractmethod
    def get_questions_by_assessment_id(self, assessment_id: UUID) -> List[QuestionResponse]:
        pass

    @abstractmethod
    def upsert_question(self, question: QuestionCreateUpdate) -> QuestionResponse:
        pass
