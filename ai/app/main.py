from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas.cycle_schemas import CyclePredictionRequest, CyclePredictionResponse
from .schemas.symptom_schemas import SymptomAnalysisRequest, SymptomAnalysisResponse
from .services.cycle_predictor import CyclePredictor
from .services.symptom_analyzer import SymptomAnalyzer
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

@app.post("/predict/cycle", response_model=CyclePredictionResponse)
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
