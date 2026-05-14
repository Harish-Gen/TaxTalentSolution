from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.user import UserCreateUpdate, UserResponse

class IUserRepository(ABC):
    @abstractmethod
    def get_user_by_id(self, user_id: UUID, include_inactive: bool = False) -> Optional[UserResponse]:
        pass

    @abstractmethod
    def get_all_users(self) -> List[UserResponse]:
        pass

    @abstractmethod
    def upsert_user(self, user: UserCreateUpdate) -> UserResponse:
        pass
