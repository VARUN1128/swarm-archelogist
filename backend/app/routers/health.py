from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import HealthResponse, ProviderStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        environment=settings.app_env,
        configured_providers=ProviderStatus(
            openai=bool(settings.openai_api_key),
            github=bool(settings.github_token),
            supabase=bool(settings.supabase_url and settings.supabase_anon_key),
        ),
    )
