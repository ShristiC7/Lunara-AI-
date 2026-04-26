from app.services.cycle_predictor import CyclePredictor
from app.schemas.cycle_schemas import CycleData
from datetime import datetime, timedelta

def test_predict_0_cycles():
    prediction = CyclePredictor.predict([])
    assert prediction["confidence"] == "LOW"
    assert (prediction["predictedDate"] - datetime.now()).days >= 27

def test_predict_1_cycle():
    start = datetime.now() - timedelta(days=5)
    cycles = [CycleData(startDate=start, cycleLength=28)]
    prediction = CyclePredictor.predict(cycles)
    assert prediction["confidence"] == "LOW"
    assert prediction["predictedDate"] == start + timedelta(days=28)

def test_predict_3_cycles_linear():
    now = datetime.now()
    cycles = [
        CycleData(startDate=now - timedelta(days=90), cycleLength=30),
        CycleData(startDate=now - timedelta(days=60), cycleLength=30),
        CycleData(startDate=now - timedelta(days=30), cycleLength=30),
    ]
    prediction = CyclePredictor.predict(cycles)
    assert prediction["confidence"] == "MEDIUM"
    assert prediction["predictedDate"].date() == now.date()
