
import sys
import os
from datetime import datetime, timedelta
import numpy as np

# Add the parent directory to sys.path to import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai')))

from app.services.cycle_predictor import CyclePredictor
from app.schemas.cycle_schemas import CycleData
from app.schemas.symptom_schemas import SymptomEntry

def test_arima_prediction():
    print("\n--- Testing ARIMA (6+ cycles) ---")
    # Stable 28 day cycles
    cycles = [CycleData(startDate=datetime.now() - timedelta(days=28*i), cycleLength=28) for i in range(1, 7)]
    result = CyclePredictor.predict(cycles)
    print(f"Predicted Date (Stable 28d): {result['predictedDate'].date()}")
    print(f"Confidence: {result['confidence']}")
    assert result['confidence'] == "HIGH"
    
    # Trending cycles: 28, 29, 30, 31, 32, 33
    cycles_trending = []
    curr = datetime.now()
    for length in [33, 32, 31, 30, 29, 28]: # Reverse for correct order in list
        curr -= timedelta(days=length)
        cycles_trending.append(CycleData(startDate=curr, cycleLength=length))
    
    result_trending = CyclePredictor.predict(cycles_trending)
    print(f"Predicted Length (Trending): {result_trending['predictedLength']:.2f}")
    # ARIMA should catch the trend or stabilize it
    assert result_trending['predictedLength'] > 28

def test_symptom_adjustment():
    print("\n--- Testing Symptom Adjustment ---")
    now = datetime.now()
    last_start = now - timedelta(days=20) # We are on day 20 of current cycle
    cycles = [CycleData(startDate=last_start, cycleLength=28)]
    
    # Baseline: no symptoms
    res1 = CyclePredictor.predict(cycles)
    print(f"Baseline Prediction: {res1['predictedDate'].date()}")
    
    # Severe symptoms on day 18 and 19
    symptoms = [
        SymptomEntry(date=last_start + timedelta(days=18), painLevel=9, energyLevel=1),
        SymptomEntry(date=last_start + timedelta(days=19), painLevel=10, energyLevel=2)
    ]
    
    res2 = CyclePredictor.predict(cycles, symptoms)
    print(f"Adjusted Prediction: {res2['predictedDate'].date()}")
    print(f"Adjustment Amount: {res2['symptomAdjustment']} days")
    
    assert res2['symptomAdjustment'] > 0
    assert res2['predictedDate'] > res1['predictedDate']

if __name__ == "__main__":
    test_arima_prediction()
    test_symptom_adjustment()
