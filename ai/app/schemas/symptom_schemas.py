from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class SymptomEntry(BaseModel):
    date: datetime
    mood: Optional[int] = None
    energyLevel: Optional[int] = None
    flowIntensity: Optional[int] = None
    painLevel: Optional[int] = None
    notes: Optional[str] = None

class SymptomAnalysisRequest(BaseModel):
    userId: str
    symptoms: List[SymptomEntry]

class SymptomAnalysisResponse(BaseModel):
    pattern_summary: str
    notable_symptoms: List[str]
    recommendation: str
    generated_at: datetime
