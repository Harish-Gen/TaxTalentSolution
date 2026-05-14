from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iassessment_repository import IAssessmentRepository
from repository.assessment_repository import AssessmentRepository
from models.assessment import AssessmentCreateUpdate, AssessmentResponse

router = APIRouter(
    prefix="/api/assessments",
    tags=["Assessments"]
)

# Dependency injection for the repository
def get_assessment_repository() -> IAssessmentRepository:
    return AssessmentRepository()

@router.get("/", response_model=List[AssessmentResponse])
def get_all_assessments(repo: IAssessmentRepository = Depends(get_assessment_repository)):
    """
    Retrieve a list of all active assessments.
    """
    try:
        return repo.get_all_assessments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: UUID, repo: IAssessmentRepository = Depends(get_assessment_repository)):
    """
    Retrieve a specific active assessment by its ID.
    """
    try:
        assessment = repo.get_assessment_by_id(assessment_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_200_OK)
def upsert_assessment(assessment: AssessmentCreateUpdate, repo: IAssessmentRepository = Depends(get_assessment_repository)):
    """
    Create a new assessment or perform a partial update on an existing assessment.
    If 'id' is provided, it updates the corresponding record (partial updates supported).
    If 'id' is not provided, it creates a new record.
    """
    try:
        if assessment.id:
            existing = repo.get_assessment_by_id(assessment.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Assessment not found for update")
            
        return repo.upsert_assessment(assessment)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
