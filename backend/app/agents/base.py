from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Generic, TypeVar

from pydantic import BaseModel

from app.schemas.common import RepositoryContext
from app.services.openai_service import OpenAIService

T = TypeVar("T", bound=BaseModel)


class BaseAgent(ABC, Generic[T]):
    def __init__(self, openai_service: OpenAIService, prompt_name: str):
        self.openai_service = openai_service
        self.prompt_name = prompt_name

    @property
    def prompt(self) -> str:
        prompt_path = Path(__file__).resolve().parents[2] / "prompts" / self.prompt_name
        return prompt_path.read_text(encoding="utf-8")

    @abstractmethod
    def response_model(self) -> type[T]:
        raise NotImplementedError

    async def run(
        self,
        repository_context: RepositoryContext,
        focused_context: dict[str, Any] | None = None,
        supplemental_context: str = "",
    ) -> T:
        return await self.openai_service.generate_structured_output(
            system_prompt=self.prompt,
            user_payload={
                "repository_context": self._shared_repository_context(repository_context),
                "focused_context": focused_context or {},
                "supplemental_context": supplemental_context,
            },
            response_model=self.response_model(),
        )

    @staticmethod
    def _shared_repository_context(repository_context: RepositoryContext) -> dict[str, Any]:
        return {
            "repository_url": repository_context.repository_url,
            "metadata": repository_context.metadata.model_dump(),
            "condensed_summary": repository_context.condensed_summary,
            "manifests": [manifest.model_dump() for manifest in repository_context.manifests],
            "optimization": repository_context.optimization.model_dump(),
            "readme_excerpt": repository_context.readme[:1800],
        }
