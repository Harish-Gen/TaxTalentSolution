from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iuserassessmentanswer_repository import IUserAssessmentAnswerRepository
from repository.userassessmentanswer_repository import UserAssessmentAnswerRepository
from models.userassessmentanswer import UserAssessmentAnswerCreateUpdate, UserAssessmentAnswerResponse

router = APIRouter(
    prefix="/api/userassessmentanswers",
    tags=["User Assessment Answers"]
)

def get_userassessmentanswer_repository() -> IUserAssessmentAnswerRepository:
    return UserAssessmentAnswerRepository()

@router.get("/", response_model=List[UserAssessmentAnswerResponse])
def get_all_userassessmentanswers(repo: IUserAssessmentAnswerRepository = Depends(get_userassessmentanswer_repository)):
    """
    Retrieve all active user assessment answers.
    """
    try:
        return repo.get_all_userassessmentanswers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/userassessment/{userassessmentid}", response_model=List[UserAssessmentAnswerResponse])
def get_userassessmentanswers_by_userassessmentid(userassessmentid: UUID, repo: IUserAssessmentAnswerRepository = Depends(get_userassessmentanswer_repository)):
    """
    Retrieve all answers for a specific user assessment ID.
    """
    try:
        return repo.get_userassessmentanswers_by_userassessmentid(userassessmentid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=UserAssessmentAnswerResponse)
def get_userassessmentanswer(id: UUID, repo: IUserAssessmentAnswerRepository = Depends(get_userassessmentanswer_repository)):
    """
    Retrieve a specific user assessment answer record by ID.
    """
    try:
        ans = repo.get_userassessmentanswer_by_id(id)
        if not ans:
            raise HTTPException(status_code=404, detail="User Assessment Answer not found")
        return ans
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=UserAssessmentAnswerResponse, status_code=status.HTTP_200_OK)
def upsert_userassessmentanswer(ans: UserAssessmentAnswerCreateUpdate, repo: IUserAssessmentAnswerRepository = Depends(get_userassessmentanswer_repository)):
    """
    Create a new user assessment answer or perform an update on an existing record.
    """
    try:
        if ans.id:
            existing = repo.get_userassessmentanswer_by_id(ans.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="User Assessment Answer not found for update")
            
        return repo.upsert_userassessmentanswer(ans)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
