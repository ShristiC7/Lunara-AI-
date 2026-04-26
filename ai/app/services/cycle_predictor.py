import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA
import warnings

from ..schemas.cycle_schemas import CycleData
from ..schemas.symptom_schemas import SymptomEntry

# Ignore convergence warnings from ARIMA for small datasets
warnings.filterwarnings("ignore")

class CyclePredictor:
    @staticmethod
    def predict(cycles: List[CycleData], symptoms: Optional[List[SymptomEntry]] = None) -> dict:
        """
        Predicts the next period start date using a hybrid approach:
        1. ARIMA for time-series patterns (if 6+ cycles)
        2. Linear Regression for trend detection (if 3-5 cycles)
        3. Symptom-based adjustment for current cycle volatility
        """
        # Default fallback
        predicted_length = 28
        confidence = "LOW"
        
        # Extract cycle lengths
        lengths = [c.cycleLength for c in cycles if c.cycleLength is not None]
        
        if len(lengths) >= 6:
            try:
                # ARIMA(1,0,0) - Simple AR model for periodicity
                model = ARIMA(lengths, order=(1, 0, 0))
                model_fit = model.fit()
                predicted_length = float(model_fit.forecast(steps=1)[0])
                confidence = "HIGH"
            except Exception:
                # Fallback to mean if ARIMA fails to converge
                predicted_length = np.mean(lengths)
                confidence = "MEDIUM"
                
        elif len(lengths) >= 3:
            # Trend-based prediction using Linear Regression
            X = np.array(range(len(lengths))).reshape(-1, 1)
            y = np.array(lengths)
            model = LinearRegression()
            model.fit(X, y)
            next_index = np.array([[len(lengths)]])
            predicted_length = float(model.predict(next_index)[0])
            confidence = "MEDIUM"
            
        elif len(lengths) > 0:
            predicted_length = np.mean(lengths)
            confidence = "LOW"
        else:
            predicted_length = 28
            confidence = "LOW"

        # Cap realistic lengths
        predicted_length = max(21, min(45, predicted_length))

        # --- Feature Engineering: Symptom-based Adjustment ---
        # Heuristic: Stress/Severe Symptoms in the late luteal phase can delay menstruation.
        symptom_adjustment = 0.0
        if symptoms and cycles:
            last_start = max(c.startDate for c in cycles)
            # Look at symptoms in the current cycle (after last_start)
            current_cycle_symptoms = [s for s in symptoms if s.date > last_start]
            
            # Identify "severe" days in the last 7 days of the current estimated cycle
            # (Rough estimate of luteal phase disruption)
            for s in current_cycle_symptoms:
                severity_score = 0
                if s.painLevel and s.painLevel > 7: severity_score += 1
                if s.energyLevel and s.energyLevel < 3: severity_score += 1
                if s.mood and s.mood < 3: severity_score += 1
                
                # Each "severe" day adds a small delay (0.5 days) to the prediction
                # This is a heuristic that can be refined with more user data.
                symptom_adjustment += (severity_score * 0.5)

        # Apply adjustment (max 3 days delay based on symptoms)
        predicted_length += min(3.0, symptom_adjustment)

        # Reference date is the last known startDate
        if cycles:
            last_start = max(c.startDate for c in cycles)
        else:
            last_start = datetime.now()

        predicted_date = last_start + timedelta(days=int(round(predicted_length)))
        
        # Ovulation is typically 14 days before next period
        ovulation_center = predicted_date - timedelta(days=14)
        ovulation_start = ovulation_center - timedelta(days=2)
        ovulation_end = ovulation_center + timedelta(days=2)

        return {
            "predictedDate": predicted_date,
            "ovulationStart": ovulation_start,
            "ovulationEnd": ovulation_end,
            "confidence": confidence,
            "predictedLength": predicted_length,
            "symptomAdjustment": symptom_adjustment
        }
