import json
from typing import Any, TypeVar

from openai import APIError, AsyncOpenAI, BadRequestError
from pydantic import BaseModel

from app.core.config import get_settings
from app.core.exceptions import ApplicationError

T = TypeVar("T", bound=BaseModel)


class OpenAIService:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.openai_model
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    async def generate_structured_output(
        self,
        system_prompt: str,
        user_payload: dict[str, Any],
        response_model: type[T],
    ) -> T:
        if self.client is None:
            raise ApplicationError(
                "OPENAI_API_KEY is required before AI analysis can continue.",
                "openai_not_configured",
            )
        try:
            response = await self.client.responses.parse(
                model=self.model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": [{"type": "input_text", "text": json.dumps(user_payload, indent=2)}]},
                ],
                text_format=response_model,
            )
            return response.output_parsed
        except BadRequestError as exc:
            raise ApplicationError(
                "OpenAI rejected the analysis request. Check model configuration and structured output schemas.",
                "openai_bad_request",
            ) from exc
        except APIError as exc:
            raise ApplicationError(
                f"OpenAI request failed: {exc.message}",
                "openai_request_failed",
            ) from exc
