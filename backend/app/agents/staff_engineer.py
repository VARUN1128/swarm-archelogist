from app.agents.base import BaseAgent
from app.schemas.analysis import StaffEngineerReview
from app.services.openai_service import OpenAIService


class StaffEngineerAgent(BaseAgent[StaffEngineerReview]):
    def __init__(self, openai_service: OpenAIService):
        super().__init__(openai_service=openai_service, prompt_name="staff_engineer.txt")

    def response_model(self) -> type[StaffEngineerReview]:
        return StaffEngineerReview
