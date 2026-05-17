from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from interfaces.iadminuser_repository import IAdminUserRepository
from repository.adminuser_repository import AdminUserRepository
from models.adminuser import AdminUserResponse

router = APIRouter(prefix="/api/adminusers", tags=["Admin Users"])


def get_repository() -> IAdminUserRepository:
    return AdminUserRepository()


@router.get("/", response_model=List[AdminUserResponse])
def get_all(repo: IAdminUserRepository = Depends(get_repository)):
    try:
        return repo.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=AdminUserResponse)
def get_by_user(user_id: UUID, repo: IAdminUserRepository = Depends(get_repository)):
    try:
        row = repo.get_by_user_id(user_id)
        if not row:
            raise HTTPException(status_code=404, detail="Admin user not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
