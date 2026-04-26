from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from .symptom_schemas import SymptomEntry

class CycleData(BaseModel):
    startDate: datetime
    endDate: Optional[datetime] = None
    cycleLength: Optional[int] = None

class CyclePredictionRequest(BaseModel):
    userId: str
    cycles: List[CycleData]
    symptoms: Optional[List[SymptomEntry]] = None

class CyclePredictionResponse(BaseModel):
    predictedDate: datetime
    ovulationStart: datetime
    ovulationEnd: datetime
    confidence: str = Field(..., pattern="^(LOW|MEDIUM|HIGH)$")
    phase: str = Field(..., pattern="^(MENSTRUAL|FOLLICULAR|OVULATORY|LUTEAL)$")
    cycleDay: int
    daysUntil: int
    predictedLength: Optional[float] = None
    finalPredictedLength: Optional[float] = None
    symptomAdjustment: Optional[float] = None
