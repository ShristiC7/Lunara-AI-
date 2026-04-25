import numpy as np
from datetime import datetime, timedelta
from typing import List
from sklearn.linear_model import LinearRegression
from ..schemas.cycle_schemas import CycleData

class CyclePredictor:
    @staticmethod
    def predict(cycles: List[CycleData]) -> dict:
        # Default fallback
        avg_length = 28
        confidence = "LOW"
        
        # Extract cycle lengths
        lengths = [c.cycleLength for c in cycles if c.cycleLength is not None]
        
        if len(lengths) >= 3:
            # ML approach: Linear Regression on cycle numbers
            X = np.array(range(len(lengths))).reshape(-1, 1)
            y = np.array(lengths)
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict next cycle length
            next_index = np.array([[len(lengths)]])
            avg_length = int(model.predict(next_index)[0])
            
            # Cap realistic lengths
            avg_length = max(21, min(45, avg_length))
            confidence = "HIGH" if len(lengths) >= 5 else "MEDIUM"
        elif len(lengths) > 0:
            avg_length = int(np.mean(lengths))
            confidence = "LOW"
        else:
            avg_length = 28
            confidence = "LOW"

        # Reference date is the last known startDate
        if cycles:
            last_start = max(c.startDate for c in cycles)
        else:
            last_start = datetime.now()

        predicted_date = last_start + timedelta(days=avg_length)
        
        # Ovulation is typically 14 days before next period
        ovulation_center = predicted_date - timedelta(days=14)
        ovulation_start = ovulation_center - timedelta(days=2)
        ovulation_end = ovulation_center + timedelta(days=2)

        return {
            "predictedDate": predicted_date,
            "ovulationStart": ovulation_start,
            "ovulationEnd": ovulation_end,
            "confidence": confidence
        }
