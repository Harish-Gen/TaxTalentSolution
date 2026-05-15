from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iemployer_repository import IEmployerRepository
from repository.employer_repository import EmployerRepository
from models.employer import EmployerCreateUpdate, EmployerResponse

router = APIRouter(
    prefix="/api/employers",
    tags=["Employers"]
)

def get_employer_repository() -> IEmployerRepository:
    return EmployerRepository()

@router.get("/", response_model=List[EmployerResponse])
def get_all_employers(repo: IEmployerRepository = Depends(get_employer_repository)):
    """
    Retrieve a list of all active employers.
    """
    try:
        return repo.get_all_employers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{employer_id}", response_model=EmployerResponse)
def get_employer(employer_id: UUID, repo: IEmployerRepository = Depends(get_employer_repository)):
    """
    Retrieve a specific active employer by its ID.
    """
    try:
        employer = repo.get_employer_by_id(employer_id)
        if not employer:
            raise HTTPException(status_code=404, detail="Employer not found")
        return employer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=EmployerResponse, status_code=status.HTTP_200_OK)
def upsert_employer(employer: EmployerCreateUpdate, repo: IEmployerRepository = Depends(get_employer_repository)):
    """
    Create a new employer or perform a partial update on an existing employer.
    """
    try:
        if employer.id:
            existing = repo.get_employer_by_id(employer.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Employer not found for update")
            
        return repo.upsert_employer(employer)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
