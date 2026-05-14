from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from interfaces.iquestion_repository import IQuestionRepository
from repository.question_repository import QuestionRepository
from models.question import QuestionCreateUpdate, QuestionResponse

router = APIRouter(
    prefix="/api/questions",
    tags=["Questions"]
)

def get_question_repository() -> IQuestionRepository:
    return QuestionRepository()

@router.get("/", response_model=List[QuestionResponse])
def get_all_questions(repo: IQuestionRepository = Depends(get_question_repository)):
    """
    Retrieve a list of all active questions, including their associated assessment details.
    """
    try:
        return repo.get_all_questions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessment/{assessment_id}", response_model=List[QuestionResponse])
def get_questions_by_assessment(assessment_id: UUID, repo: IQuestionRepository = Depends(get_question_repository)):
    """
    Retrieve all questions mapped to a specific assessment ID.
    """
    try:
        return repo.get_questions_by_assessment_id(assessment_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: UUID, repo: IQuestionRepository = Depends(get_question_repository)):
    """
    Retrieve a specific active question by its ID, including associated assessments.
    """
    try:
        question = repo.get_question_by_id(question_id)
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        return question
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=QuestionResponse, status_code=status.HTTP_200_OK)
def upsert_question(question: QuestionCreateUpdate, repo: IQuestionRepository = Depends(get_question_repository)):
    """
    Create a new question or perform a partial update on an existing question.
    Also handles linking to assessments if `assessment_ids` is provided.
    """
    try:
        if question.id:
            existing = repo.get_question_by_id(question.id, include_inactive=True)
            if not existing:
                raise HTTPException(status_code=404, detail="Question not found for update")
            
        return repo.upsert_question(question)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
