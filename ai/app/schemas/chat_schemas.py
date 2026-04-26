from pydantic import BaseModel
from typing import List, Optional, Any

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    user_prompt: str
    health_context: Optional[dict] = None
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    disclaimer: str = "Disclaimer: I am an AI, not a doctor. Please consult a healthcare professional for medical advice."
