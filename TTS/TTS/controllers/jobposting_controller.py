from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.ijobposting_repository import IJobPostingRepository
from repository.jobposting_repository import JobPostingRepository
from models.jobposting import JobPostingCreateUpdate, JobPostingResponse

router = APIRouter(
    prefix="/api/jobpostings",
    tags=["Job Postings"]
)

def get_jobposting_repository() -> IJobPostingRepository:
    return JobPostingRepository()

@router.get("/", response_model=List[JobPostingResponse])
def get_all_jobpostings(repo: IJobPostingRepository = Depends(get_jobposting_repository)):
    """
    Retrieve a list of all active job postings.
    """
    try:
        return repo.get_all_jobpostings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{jobposting_id}", response_model=JobPostingResponse)
def get_jobposting(jobposting_id: UUID, repo: IJobPostingRepository = Depends(get_jobposting_repository)):
    """
    Retrieve a specific active job posting by its ID.
    """
    try:
        jobposting = repo.get_jobposting_by_id(jobposting_id)
        if not jobposting:
            raise HTTPException(status_code=404, detail="Job posting not found")
        return jobposting
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=JobPostingResponse, status_code=status.HTTP_200_OK)
def upsert_jobposting(jobposting: JobPostingCreateUpdate, repo: IJobPostingRepository = Depends(get_jobposting_repository)):
    """
    Create a new job posting or perform a partial update on an existing job posting.
    """
    try:
        if jobposting.id:
            existing = repo.get_jobposting_by_id(jobposting.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Job posting not found for update")
            
        return repo.upsert_jobposting(jobposting)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
