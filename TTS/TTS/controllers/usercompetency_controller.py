from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iusercompetency_repository import IUserCompetencyRepository
from repository.usercompetency_repository import UserCompetencyRepository
from models.usercompetency import UserCompetencyCreateUpdate, UserCompetencyResponse

router = APIRouter(
    prefix="/api/usercompetencies",
    tags=["User Competencies"]
)

def get_usercompetency_repository() -> IUserCompetencyRepository:
    return UserCompetencyRepository()

@router.get("/", response_model=List[UserCompetencyResponse])
def get_all_usercompetencies(repo: IUserCompetencyRepository = Depends(get_usercompetency_repository)):
    """
    Retrieve all active user competencies.
    """
    try:
        return repo.get_all_usercompetencies()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[UserCompetencyResponse])
def get_usercompetencies_by_user(user_id: UUID, repo: IUserCompetencyRepository = Depends(get_usercompetency_repository)):
    """
    Retrieve all competencies for a specific user ID.
    """
    try:
        return repo.get_usercompetencies_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=UserCompetencyResponse)
def get_usercompetency(id: UUID, repo: IUserCompetencyRepository = Depends(get_usercompetency_repository)):
    """
    Retrieve a specific user competency record by ID.
    """
    try:
        comp = repo.get_usercompetency_by_id(id)
        if not comp:
            raise HTTPException(status_code=404, detail="User Competency not found")
        return comp
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=UserCompetencyResponse, status_code=status.HTTP_200_OK)
def upsert_usercompetency(comp: UserCompetencyCreateUpdate, repo: IUserCompetencyRepository = Depends(get_usercompetency_repository)):
    """
    Create a new user competency or perform an update on an existing record.
    """
    try:
        if comp.id:
            existing = repo.get_usercompetency_by_id(comp.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="User Competency not found for update")
            
        return repo.upsert_usercompetency(comp)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
