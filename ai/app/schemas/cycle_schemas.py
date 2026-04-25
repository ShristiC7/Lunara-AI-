from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CycleData(BaseModel):
    startDate: datetime
    endDate: Optional[datetime] = None
    cycleLength: Optional[int] = None

class CyclePredictionRequest(BaseModel):
    userId: str
    cycles: List[CycleData]

class CyclePredictionResponse(BaseModel):
    predictedDate: datetime
    ovulationStart: datetime
    ovulationEnd: datetime
    confidence: str = Field(..., pattern="^(LOW|MEDIUM|HIGH)$")
