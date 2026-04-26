import numpy as np
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sklearn.linear_model import LinearRegression
import warnings

from ..schemas.cycle_schemas import CycleData
from ..schemas.symptom_schemas import SymptomEntry

class CyclePredictor:
    @staticmethod
    def predict(cycles: List[CycleData], symptoms: Optional[List[SymptomEntry]] = None) -> dict:
        """
        Predicts the next period start date using a multi-factor hybrid model:
        1. Weighted Moving Average (WMA) to capture recent periodicity.
        2. Linear Regression to detect long-term trends (e.g., cycles getting longer/shorter).
        3. Symptom-based disruption factor (late-cycle stress/pain adjustment).
        """
        # Fallbacks
        predicted_length = 28
        confidence = "LOW"
        
        # Extract cycle lengths
        lengths = [c.cycleLength for c in cycles if c.cycleLength is not None]
        
        if len(lengths) >= 3:
            # Factor 1: Weighted Moving Average (gives more weight to recent cycles)
            weights = np.arange(1, len(lengths) + 1)
            wma = np.average(lengths, weights=weights)
            
            # Factor 2: Linear Regression (Trend)
            X = np.array(range(len(lengths))).reshape(-1, 1)
            y = np.array(lengths)
            model = LinearRegression()
            model.fit(X, y)
            next_index = np.array([[len(lengths)]])
            trend_prediction = float(model.predict(next_index)[0])
            
            # Hybrid: 70% WMA (Periodic) + 30% Trend (Linear)
            # This balances cycle stability with gradual changes.
            predicted_length = (0.7 * wma) + (0.3 * trend_prediction)
            
            confidence = "HIGH" if len(lengths) >= 6 else "MEDIUM"
            
        elif len(lengths) > 0:
            predicted_length = np.mean(lengths)
            confidence = "LOW"
        else:
            predicted_length = 28
            confidence = "LOW"

        # Cap realistic lengths (21-45 days)
        predicted_length = max(21, min(45, predicted_length))

        # --- Feature Engineering: Symptom-based Adjustment ---
        # Heuristic: Stress/Severe Symptoms in the luteal phase (last ~10 days) 
        # can delay menstruation by delaying the hormonal drop or ovulation.
        symptom_adjustment = 0.0
        if symptoms and cycles:
            last_start = max(c.startDate for c in cycles)
            # Look at symptoms in the current cycle (after last_start)
            current_cycle_symptoms = [s for s in symptoms if s.date > last_start]
            
            # Identify "severe" days (Pain > 7, Energy < 3, Mood < 3)
            # We specifically look for disruptions that haven't yet resulted in a period.
            for s in current_cycle_symptoms:
                severity_count = 0
                if s.painLevel and s.painLevel > 7: severity_count += 1
                if s.energyLevel and s.energyLevel < 3: severity_count += 1
                if s.mood and s.mood < 3: severity_count += 1
                
                # If a day was highly symptomatic/stressful, add 0.5 days to prediction
                # (Max 4 days total adjustment)
                symptom_adjustment += (severity_count * 0.5)

        # Apply adjustment (cap at 4 days)
        final_predicted_length = predicted_length + min(4.0, symptom_adjustment)

        # Reference date is the last known startDate
        if cycles:
            last_start = max(c.startDate for c in cycles)
        else:
            last_start = datetime.now(timezone.utc)

        predicted_date = last_start + timedelta(days=int(round(final_predicted_length)))
        
        # Ovulation is typically 14 days before next period
        ovulation_center = predicted_date - timedelta(days=14)
        ovulation_start = ovulation_center - timedelta(days=2)
        ovulation_end = ovulation_center + timedelta(days=2)

        # --- Phase & Cycle Day Calculation ---
        now = datetime.now(timezone.utc)
        cycle_day = (now - last_start).days + 1
        days_until = (predicted_date - now).days
        
        # Determine Phase based on standard ranges
        if cycle_day <= 5:
            phase = "MENSTRUAL"
        elif cycle_day <= 11:
            phase = "FOLLICULAR"
        elif cycle_day <= 16:
            phase = "OVULATORY"
        else:
            phase = "LUTEAL"

        return {
            "predictedDate": predicted_date,
            "ovulationStart": ovulation_start,
            "ovulationEnd": ovulation_end,
            "confidence": confidence,
            "phase": phase,
            "cycleDay": cycle_day,
            "daysUntil": max(0, days_until),
            "predictedLength": predicted_length,
            "finalPredictedLength": final_predicted_length,
            "symptomAdjustment": min(4.0, symptom_adjustment)
        }
