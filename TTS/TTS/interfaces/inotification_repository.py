from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from models.notification import NotificationCreateUpdate, NotificationResponse


class INotificationRepository(ABC):
    @abstractmethod
    def get_by_user_id(self, userid: UUID) -> List[NotificationResponse]:
        pass

    @abstractmethod
    def upsert(self, data: NotificationCreateUpdate) -> NotificationResponse:
        pass
