from app.agents.base import BaseAgent
from app.schemas.analysis import ArchitectureReport, PerformanceReport, QAReport, SecurityReport
from app.services.openai_service import OpenAIService


class ArchitectAgent(BaseAgent[ArchitectureReport]):
    def __init__(self, openai_service: OpenAIService):
        super().__init__(openai_service=openai_service, prompt_name="architect.txt")

    def response_model(self) -> type[ArchitectureReport]:
        return ArchitectureReport


class SecurityAgent(BaseAgent[SecurityReport]):
    def __init__(self, openai_service: OpenAIService):
        super().__init__(openai_service=openai_service, prompt_name="security.txt")

    def response_model(self) -> type[SecurityReport]:
        return SecurityReport


class QAAgent(BaseAgent[QAReport]):
    def __init__(self, openai_service: OpenAIService):
        super().__init__(openai_service=openai_service, prompt_name="qa.txt")

    def response_model(self) -> type[QAReport]:
        return QAReport


class PerformanceAgent(BaseAgent[PerformanceReport]):
    def __init__(self, openai_service: OpenAIService):
        super().__init__(openai_service=openai_service, prompt_name="performance.txt")

    def response_model(self) -> type[PerformanceReport]:
        return PerformanceReport
