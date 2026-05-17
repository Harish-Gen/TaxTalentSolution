from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
import pyodbc
from interfaces.ijobapplication_repository import IJobApplicationRepository
from repository.jobapplication_repository import JobApplicationRepository
from models.jobapplication import JobApplicationCreateUpdate, JobApplicationResponse

router = APIRouter(prefix="/api/jobapplications", tags=["Job Applications"])


def get_repository() -> IJobApplicationRepository:
    return JobApplicationRepository()


@router.get("/", response_model=List[JobApplicationResponse])
def get_all(repo: IJobApplicationRepository = Depends(get_repository)):
    try:
        return repo.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/candidate/{candidate_id}", response_model=List[JobApplicationResponse])
def get_by_candidate(candidate_id: UUID, repo: IJobApplicationRepository = Depends(get_repository)):
    try:
        return repo.get_by_candidate_id(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=List[JobApplicationResponse])
def get_by_user(user_id: UUID, repo: IJobApplicationRepository = Depends(get_repository)):
    try:
        return repo.get_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employer/{employer_id}", response_model=List[JobApplicationResponse])
def get_by_employer(employer_id: UUID, repo: IJobApplicationRepository = Depends(get_repository)):
    try:
        return repo.get_by_employer_id(employer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{application_id}", response_model=JobApplicationResponse)
def get_by_id(application_id: UUID, repo: IJobApplicationRepository = Depends(get_repository)):
    try:
        row = repo.get_by_id(application_id)
        if not row:
            raise HTTPException(status_code=404, detail="Application not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=JobApplicationResponse, status_code=status.HTTP_200_OK)
def upsert(
    application: JobApplicationCreateUpdate,
    repo: IJobApplicationRepository = Depends(get_repository),
):
    try:
        if application.id:
            existing = repo.get_by_id(application.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Application not found for update")
        return repo.upsert(application)
    except HTTPException:
        raise
    except pyodbc.IntegrityError as e:
        err = str(e)
        if "UQ_job_applications_job_candidate" in err:
            existing = repo.get_by_job_and_candidate(
                application.jobpostingid, application.candidateid
            )
            if existing:
                application.id = existing.id
                return repo.upsert(application)
            raise HTTPException(
                status_code=409,
                detail="You have already applied to this job.",
            )
        raise HTTPException(status_code=409, detail="Application could not be saved due to a conflict.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
