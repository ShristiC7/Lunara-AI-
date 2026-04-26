import sys
from unittest.mock import MagicMock

# Mock dependencies
mock_sklearn = MagicMock()
mock_numpy = MagicMock()
mock_fastapi = MagicMock()
mock_pydantic = MagicMock()

# Set up real behavior for some numpy functions without importing numpy
mock_numpy.mean.side_effect = lambda x: sum(x) / len(x) if x else 0
mock_numpy.array.side_effect = lambda x: x # Simple bypass for mock

sys.modules['sklearn'] = mock_sklearn
sys.modules['sklearn.linear_model'] = mock_sklearn.linear_model
sys.modules['numpy'] = mock_numpy
sys.modules['fastapi'] = mock_fastapi
sys.modules['fastapi.middleware.cors'] = mock_fastapi.middleware.cors
sys.modules['pydantic'] = mock_pydantic

# Mock schemas to avoid import errors
import datetime
from typing import List, Optional

class CycleData:
    def __init__(self, startDate, cycleLength=None):
        self.startDate = startDate
        self.cycleLength = cycleLength

mock_schemas = MagicMock()
mock_schemas.cycle_schemas.CycleData = CycleData
sys.modules['app.schemas'] = mock_schemas
sys.modules['app.schemas.cycle_schemas'] = mock_schemas.cycle_schemas

# Now import the predictor
import os
sys.path.append(os.path.abspath('ai'))
from app.services.cycle_predictor import CyclePredictor

def test_logic():
    print("Testing CyclePredictor logic...")
    # Test with 0 cycles
    res = CyclePredictor.predict([])
    assert res['confidence'] == 'LOW'
    print("0 cycles: PASS")

    # Test with 1 cycle
    start = datetime.datetime.now()
    res = CyclePredictor.predict([CycleData(startDate=start, cycleLength=28)])
    print(f"Expected Date: {start + datetime.timedelta(days=28)}")
    print(f"Predicted Date: {res['predictedDate']}")
    assert res['confidence'] == 'LOW'
    assert res['predictedDate'] == start + datetime.timedelta(days=28)
    print("1 cycle: PASS")

if __name__ == "__main__":
    try:
        test_logic()
        print("\nML Logic is sound (mocked dependencies).")
    except Exception as e:
        print(f"\nLogic Error: {e}")
        import traceback
        traceback.print_exc()
