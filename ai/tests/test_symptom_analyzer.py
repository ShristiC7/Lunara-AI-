import pytest
import json
from unittest.mock import patch
from app.services.symptom_analyzer import SymptomAnalyzer
from app.schemas.symptom_schemas import SymptomEntry
from datetime import datetime

@pytest.mark.asyncio
async def test_symptom_analysis_success():
    mock_response = {
        "pattern_summary": "Looking stable",
        "notable_symptoms": ["Mild pain"],
        "recommendation": "Stay hydrated"
    }
    
    with patch("app.services.symptom_analyzer.analyze_with_openai") as mock_openai:
        mock_openai.return_value = json.dumps(mock_response)
        
        symptoms = [SymptomEntry(date=datetime.now(), painLevel=2, notes="Feeling okay")]
        result = await SymptomAnalyzer.analyze(symptoms)
        
        assert result.pattern_summary == "Looking stable"
        assert "Mild pain" in result.notable_symptoms
        assert result.recommendation == "Stay hydrated"

@pytest.mark.asyncio
async def test_sanitize_notes():
    dirty_notes = "Injection { test } <script>alert(1)</script>"
    clean = SymptomAnalyzer._sanitize_notes(dirty_notes)
    assert "{" not in clean
    assert "<" not in clean
    assert "script" in clean # Tags are stripped but text remains
    assert "alert(1)" in clean
