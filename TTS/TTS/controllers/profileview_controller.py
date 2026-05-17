from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Dict
from uuid import UUID
from interfaces.iprofileview_repository import IProfileViewRepository
from repository.profileview_repository import ProfileViewRepository
from models.profileview import ProfileViewCreate, ProfileViewResponse

router = APIRouter(prefix="/api/profileviews", tags=["Profile Views"])


def get_repository() -> IProfileViewRepository:
    return ProfileViewRepository()


@router.post("/", response_model=ProfileViewResponse, status_code=status.HTTP_200_OK)
def record(view: ProfileViewCreate, repo: IProfileViewRepository = Depends(get_repository)):
    try:
        return repo.record(view)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/counts", response_model=Dict[str, int])
def get_counts(
    candidateIds: str = Query(..., description="Comma-separated candidate UUIDs"),
    repo: IProfileViewRepository = Depends(get_repository),
):
    try:
        ids = [UUID(x.strip()) for x in candidateIds.split(",") if x.strip()]
        return repo.get_counts_by_candidate_ids(ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employer/{employer_id}", response_model=List[ProfileViewResponse])
def get_by_employer(
    employer_id: UUID, repo: IProfileViewRepository = Depends(get_repository)
):
    try:
        return repo.get_by_employer_id(employer_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
