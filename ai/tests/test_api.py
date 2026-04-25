import pytest

@pytest.mark.asyncio
async def test_health_check(async_client):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_predict_cycle_api(async_client):
    payload = {
        "userId": "user-1",
        "cycles": [
            {"startDate": "2023-01-01T00:00:00Z", "cycleLength": 28}
        ]
    }
    response = await async_client.post("/predict/cycle", json=payload)
    assert response.status_code == 200
    assert "predictedDate" in response.json()
    assert response.json()["confidence"] == "LOW"
