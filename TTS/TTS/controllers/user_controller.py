from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iuser_repository import IUserRepository
from repository.user_repository import UserRepository
from models.user import UserCreateUpdate, UserResponse, UserLogin, UserLoginResponse

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)

def get_user_repository() -> IUserRepository:
    return UserRepository()

@router.post("/login", response_model=UserLoginResponse)
def login_user(login_data: UserLogin, repo: IUserRepository = Depends(get_user_repository)):
    """
    Authenticate a user by email and return their full profile if found.
    """
    try:
        user = repo.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or user not found")
        
        return UserLoginResponse(
            message="Login successful",
            user=user
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[UserResponse])
def get_all_users(repo: IUserRepository = Depends(get_user_repository)):
    """
    Retrieve a list of all active users, including their assigned employer IDs.
    """
    try:
        return repo.get_all_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, repo: IUserRepository = Depends(get_user_repository)):
    """
    Retrieve a specific active user by its ID.
    """
    try:
        user = repo.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=UserResponse, status_code=status.HTTP_200_OK)
def upsert_user(user: UserCreateUpdate, repo: IUserRepository = Depends(get_user_repository)):
    """
    Create a new user or perform a partial update on an existing user.
    Also handles assigning or removing employer links if `employer_ids` is provided.
    """
    try:
        if user.id:
            existing = repo.get_user_by_id(user.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="User not found for update")
            
        return repo.upsert_user(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
