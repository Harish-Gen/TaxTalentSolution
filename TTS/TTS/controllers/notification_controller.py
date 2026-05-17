from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.inotification_repository import INotificationRepository
from repository.notification_repository import NotificationRepository
from models.notification import NotificationCreateUpdate, NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def get_repository() -> INotificationRepository:
    return NotificationRepository()


@router.get("/user/{user_id}", response_model=List[NotificationResponse])
def get_by_user(user_id: UUID, repo: INotificationRepository = Depends(get_repository)):
    try:
        return repo.get_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_200_OK)
def upsert(
    notification: NotificationCreateUpdate,
    repo: INotificationRepository = Depends(get_repository),
):
    try:
        return repo.upsert(notification)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
