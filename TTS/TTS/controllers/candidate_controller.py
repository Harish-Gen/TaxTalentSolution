from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.icandidate_repository import ICandidateRepository
from repository.candidate_repository import CandidateRepository
from models.candidate import CandidateCreateUpdate, CandidateResponse

router = APIRouter(
    prefix="/api/candidates",
    tags=["Candidates"]
)

# Dependency injection for the repository
def get_candidate_repository() -> ICandidateRepository:
    return CandidateRepository()

@router.get("/", response_model=List[CandidateResponse])
def get_all_candidates(repo: ICandidateRepository = Depends(get_candidate_repository)):
    """
    Retrieve a list of all candidates.
    """
    try:
        return repo.get_all_candidates()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(candidate_id: UUID, repo: ICandidateRepository = Depends(get_candidate_repository)):
    """
    Retrieve a specific candidate by their ID.
    """
    try:
        candidate = repo.get_candidate_by_id(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_200_OK)
def upsert_candidate(candidate: CandidateCreateUpdate, repo: ICandidateRepository = Depends(get_candidate_repository)):
    """
    Create a new candidate or perform a partial update on an existing candidate.
    If 'id' is provided, it updates the corresponding record (partial updates supported).
    If 'id' is not provided, it creates a new record.
    """
    try:
        if candidate.id:
            existing = repo.get_candidate_by_id(candidate.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Candidate not found for update")
            
        return repo.upsert_candidate(candidate)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
