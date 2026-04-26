
import sys
import os
from datetime import datetime, timedelta
import numpy as np

# Add the parent directory to sys.path to import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai')))

from app.services.cycle_predictor import CyclePredictor
from app.schemas.cycle_schemas import CycleData

def generate_synthetic_data(num_cycles=12, mean_length=28, std_dev=2):
    cycles = []
    current_date = datetime.now() - timedelta(days=num_cycles * mean_length)
    
    lengths = np.random.normal(mean_length, std_dev, num_cycles).astype(int)
    lengths = np.clip(lengths, 21, 45)
    
    for length in lengths:
        cycles.append(CycleData(startDate=current_date, cycleLength=int(length)))
        current_date += timedelta(days=int(length))
        
    return cycles, int(np.random.normal(mean_length, std_dev)) # Actual next length

def evaluate_model(iterations=100):
    errors = []
    confidences = []
    
    for _ in range(iterations):
        cycles, actual_next = generate_synthetic_data()
        # Use first 11 to predict the 12th
        prediction_input = cycles[:-1]
        actual_length = cycles[-1].cycleLength
        
        result = CyclePredictor.predict(prediction_input)
        
        predicted_date = result["predictedDate"]
        last_start = cycles[-2].startDate
        predicted_length = (predicted_date - last_start).days
        
        error = abs(predicted_length - actual_length)
        errors.append(error)
        confidences.append(result["confidence"])
        
    print(f"--- Model Evaluation (n={iterations}) ---")
    print(f"Mean Absolute Error: {np.mean(errors):.2f} days")
    print(f"Median Absolute Error: {np.median(errors):.2f} days")
    print(f"Max Error: {np.max(errors)} days")
    print(f"Confidence Levels: { {c: confidences.count(c) for c in set(confidences)} }")

if __name__ == "__main__":
    evaluate_model()
