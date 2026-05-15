from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iuserassessment_repository import IUserAssessmentRepository
from repository.userassessment_repository import UserAssessmentRepository
from models.userassessment import UserAssessmentCreateUpdate, UserAssessmentResponse

router = APIRouter(
    prefix="/api/userassessments",
    tags=["User Assessments"]
)

def get_userassessment_repository() -> IUserAssessmentRepository:
    return UserAssessmentRepository()

@router.get("/", response_model=List[UserAssessmentResponse])
def get_all_userassessments(repo: IUserAssessmentRepository = Depends(get_userassessment_repository)):
    """
    Retrieve all active user assessments.
    """
    try:
        return repo.get_all_userassessments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[UserAssessmentResponse])
def get_userassessments_by_user(user_id: UUID, repo: IUserAssessmentRepository = Depends(get_userassessment_repository)):
    """
    Retrieve all assessments linked to a specific user.
    """
    try:
        return repo.get_userassessments_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessment/{assessment_id}", response_model=List[UserAssessmentResponse])
def get_userassessments_by_assessment(assessment_id: UUID, repo: IUserAssessmentRepository = Depends(get_userassessment_repository)):
    """
    Retrieve all user records taking a specific assessment.
    """
    try:
        return repo.get_userassessments_by_assessment_id(assessment_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=UserAssessmentResponse)
def get_userassessment(id: UUID, repo: IUserAssessmentRepository = Depends(get_userassessment_repository)):
    """
    Retrieve a specific user assessment record by ID.
    """
    try:
        ua = repo.get_userassessment_by_id(id)
        if not ua:
            raise HTTPException(status_code=404, detail="User Assessment not found")
        return ua
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=UserAssessmentResponse, status_code=status.HTTP_200_OK)
def upsert_userassessment(ua: UserAssessmentCreateUpdate, repo: IUserAssessmentRepository = Depends(get_userassessment_repository)):
    """
    Create a new user assessment or perform an update on an existing record.
    """
    try:
        if ua.id:
            existing = repo.get_userassessment_by_id(ua.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="User Assessment not found for update")
            
        return repo.upsert_userassessment(ua)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
