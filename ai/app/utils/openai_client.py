import os
from openai import AsyncOpenAI
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from openai import RateLimitError, APIStatusError

class OpenAIClient:
    _instance = None

    @classmethod
    def get_client(cls):
        if cls._instance is None:
            cls._instance = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        return cls._instance

@retry(
    wait=wait_exponential(min=1, max=60),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type((RateLimitError, APIStatusError)),
)
async def analyze_with_openai(messages: list, response_format: dict = None):
    client = OpenAIClient.get_client()
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format=response_format,
        temperature=0.7,
    )
    return response.choices[0].message.content
