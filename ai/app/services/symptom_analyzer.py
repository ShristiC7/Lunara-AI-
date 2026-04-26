import json
from datetime import datetime
from typing import List, Optional
from ..schemas.symptom_schemas import SymptomEntry, SymptomAnalysisResponse
from ..utils.openai_client import analyze_with_openai

class SymptomAnalyzer:
    SYSTEM_PROMPT = """
    You are an expert women's health AI. Your goal is to analyze the user's menstrual cycle symptoms and provide structured, helpful, and supportive health insights.
    - Focus on patterns across dates.
    - Provide actionable, evidence-based recommendations.
    - Always include a disclaimer that this is not a medical diagnosis.
    - Output MUST be valid JSON matching the schema.
    """

    @staticmethod
    def _sanitize_notes(notes: Optional[str]) -> str:
        if not notes:
            return ""
        # Basic sanitization: strip special chars that could influence prompt
        return notes.replace("{", "[").replace("}", "]").replace("<", "").replace(">", "")[:500]

    @classmethod
    async def analyze(cls, symptoms: List[SymptomEntry]) -> SymptomAnalysisResponse:
        # Prepare data for GPT
        data_to_analyze = []
        for s in symptoms:
            data_to_analyze.append({
                "date": s.date.isoformat(),
                "mood": s.mood,
                "energy": s.energyLevel,
                "flow": s.flowIntensity,
                "pain": s.painLevel,
                "notes": cls._sanitize_notes(s.notes)
            })

        user_content = f"Analyze the following symptom logs: {json.dumps(data_to_analyze)}"
        
        messages = [
            {"role": "system", "content": cls.SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]

        response_text = await analyze_with_openai(
            messages=messages,
            response_format={"type": "json_object"}
        )

        analysis_data = json.loads(response_text)
        
        return SymptomAnalysisResponse(
            pattern_summary=analysis_data.get("pattern_summary", ""),
            notable_symptoms=analysis_data.get("notable_symptoms", []),
            recommendation=analysis_data.get("recommendation", ""),
            generated_at=datetime.now()
        )
