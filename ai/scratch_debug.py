
import sys
import os
from datetime import datetime, timezone

# Add the ai directory to the path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'ai'))

from app.services.cycle_predictor import CyclePredictor
from app.schemas.cycle_schemas import CycleData

def test_prediction():
    # Mock cycles for Rii
    cycles = [
        CycleData(startDate=datetime(2026, 1, 1, tzinfo=timezone.utc), cycleLength=28),
        CycleData(startDate=datetime(2026, 1, 29, tzinfo=timezone.utc), cycleLength=28),
        CycleData(startDate=datetime(2026, 2, 26, tzinfo=timezone.utc), cycleLength=28),
        CycleData(startDate=datetime(2026, 3, 26, tzinfo=timezone.utc))
    ]
    
    try:
        result = CyclePredictor.predict(cycles, symptoms=None)
        print("SUCCESS:", result)
    except Exception as e:
        import traceback
        print("FAILED:")
        traceback.print_exc()

if __name__ == "__main__":
    test_prediction()
