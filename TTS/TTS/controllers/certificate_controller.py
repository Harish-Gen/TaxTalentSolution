from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.icertificate_repository import ICertificateRepository
from repository.certificate_repository import CertificateRepository
from models.certificate import CertificateCreateUpdate, CertificateResponse

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])


def get_repository() -> ICertificateRepository:
    return CertificateRepository()


@router.get("/candidate/{candidate_id}", response_model=List[CertificateResponse])
def get_by_candidate(candidate_id: UUID, repo: ICertificateRepository = Depends(get_repository)):
    try:
        return repo.get_by_candidate_id(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}", response_model=List[CertificateResponse])
def get_by_user(user_id: UUID, repo: ICertificateRepository = Depends(get_repository)):
    try:
        return repo.get_by_user_id(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{certificate_id}", response_model=CertificateResponse)
def get_by_id(certificate_id: UUID, repo: ICertificateRepository = Depends(get_repository)):
    try:
        row = repo.get_by_id(certificate_id)
        if not row:
            raise HTTPException(status_code=404, detail="Certificate not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=CertificateResponse, status_code=status.HTTP_200_OK)
def upsert(
    certificate: CertificateCreateUpdate,
    repo: ICertificateRepository = Depends(get_repository),
):
    try:
        if certificate.id:
            existing = repo.get_by_id(certificate.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Certificate not found for update")
        return repo.upsert(certificate)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
