import os
import json
from openai import AsyncOpenAI
from typing import List, Optional
from ..schemas.chat_schemas import ChatMessage

class ChatService:
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    @classmethod
    async def get_response(cls, user_prompt: str, health_context: Optional[dict], history: List[ChatMessage]) -> str:
        # Build System Prompt
        system_prompt = (
            "You are Lunara, a supportive and intelligent women's health AI assistant. "
            "Your goal is to provide personalized, data-driven insights based on the user's menstrual cycle and symptoms. "
            "\n\nSTRICT GUIDELINES:\n"
            "1. You are NOT a doctor. Never provide medical diagnoses or specific medication dosages.\n"
            "2. Always maintain a warm, empathetic, yet professional tone.\n"
            "3. Use the provided biological context to make your answers deeply personal.\n"
            "4. If asked about severe medical issues (e.g., severe pain, unusual bleeding), strongly advise seeing a healthcare provider."
        )

        if health_context:
            context_str = f"\n\nUSER BIOLOGICAL CONTEXT:\n{json.dumps(health_context, indent=2)}"
            system_prompt += context_str

        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history (limit to last 10 messages)
        for msg in history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
            
        # Add current prompt
        messages.append({"role": "user", "content": user_prompt})

        try:
            response = await cls.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {e}")
            return "I'm having trouble connecting to my brain right now. Please try again in a moment."
