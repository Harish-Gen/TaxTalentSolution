from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.adminuser import AdminUserResponse


class IAdminUserRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[AdminUserResponse]:
        pass

    @abstractmethod
    def get_by_user_id(self, userid: UUID) -> Optional[AdminUserResponse]:
        pass
