from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.isavedcandidate_repository import ISavedCandidateRepository
from repository.savedcandidate_repository import SavedCandidateRepository
from models.savedcandidate import SavedCandidateCreateUpdate, SavedCandidateResponse

router = APIRouter(prefix="/api/savedcandidates", tags=["Saved Candidates"])


def get_repository() -> ISavedCandidateRepository:
    return SavedCandidateRepository()


@router.get("/employer/{employer_id}", response_model=List[SavedCandidateResponse])
def get_by_employer(
    employer_id: UUID, repo: ISavedCandidateRepository = Depends(get_repository)
):
    try:
        return repo.get_by_employer_id(employer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employer/{employer_id}/candidate/{candidate_id}", response_model=SavedCandidateResponse)
def get_one(
    employer_id: UUID,
    candidate_id: UUID,
    repo: ISavedCandidateRepository = Depends(get_repository),
):
    try:
        row = repo.get_by_employer_and_candidate(employer_id, candidate_id)
        if not row or row.isactive is False:
            raise HTTPException(status_code=404, detail="Not saved")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=SavedCandidateResponse, status_code=status.HTTP_200_OK)
def upsert(
    row: SavedCandidateCreateUpdate,
    repo: ISavedCandidateRepository = Depends(get_repository),
):
    try:
        return repo.upsert(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
