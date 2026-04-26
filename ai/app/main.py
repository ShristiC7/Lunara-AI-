from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from .schemas.cycle_schemas import CyclePredictionRequest, CyclePredictionResponse
from .schemas.symptom_schemas import SymptomAnalysisRequest, SymptomAnalysisResponse
from .services.cycle_predictor import CyclePredictor
from .services.symptom_analyzer import SymptomAnalyzer
from .schemas.chat_schemas import ChatRequest, ChatResponse
from .services.chat_service import ChatService
import uvicorn

app = FastAPI(title="Lunara AI Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

from typing import Optional
@app.post("/predict/cycle", response_model=Optional[CyclePredictionResponse])
async def predict_cycle(request: CyclePredictionRequest):
    try:
        prediction = CyclePredictor.predict(request.cycles, request.symptoms)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/symptoms", response_model=SymptomAnalysisResponse)
async def analyze_symptoms(request: SymptomAnalysisRequest):
    try:
        analysis = await SymptomAnalyzer.analyze(request.symptoms)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest):
    try:
        response = await ChatService.get_response(
            request.user_prompt, 
            request.health_context, 
            request.history
        )
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
