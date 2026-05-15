from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from controllers.candidate_controller import router as candidate_router
from controllers.assessment_controller import router as assessment_router
from controllers.employer_controller import router as employer_router
from controllers.jobposting_controller import router as jobposting_router
from controllers.user_controller import router as user_router
from controllers.question_controller import router as question_router
from controllers.usercompetency_controller import router as usercompetency_router
from controllers.userassessment_controller import router as userassessment_router

app = FastAPI(title="TTS API Endpoints", description="A structured FastAPI application with Repository Pattern")

# Enable CORS if necessary
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(candidate_router)
app.include_router(assessment_router)
app.include_router(employer_router)
app.include_router(jobposting_router)
app.include_router(user_router)
app.include_router(question_router)
app.include_router(usercompetency_router)
app.include_router(userassessment_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the TTS API"}

if __name__ == "__main__":
    # Run the application
    uvicorn.run("TTS:app", host="127.0.0.1", port=8000, reload=True)
