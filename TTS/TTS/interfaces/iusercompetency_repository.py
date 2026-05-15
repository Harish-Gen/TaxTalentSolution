from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.usercompetency import UserCompetencyCreateUpdate, UserCompetencyResponse

class IUserCompetencyRepository(ABC):
    @abstractmethod
    def get_usercompetency_by_id(self, id: UUID, include_inactive: bool = False) -> Optional[UserCompetencyResponse]:
        pass

    @abstractmethod
    def get_all_usercompetencies(self) -> List[UserCompetencyResponse]:
        pass

    @abstractmethod
    def get_usercompetencies_by_user_id(self, userid: UUID) -> List[UserCompetencyResponse]:
        pass

    @abstractmethod
    def upsert_usercompetency(self, data: UserCompetencyCreateUpdate) -> UserCompetencyResponse:
        pass
