from pydantic import BaseModel, ConfigDict, Field


class StrictBaseModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ErrorResponse(StrictBaseModel):
    error: str
    message: str


class ProviderStatus(StrictBaseModel):
    openai: bool
    github: bool
    supabase: bool


class HealthResponse(StrictBaseModel):
    status: str
    app_name: str
    environment: str
    configured_providers: ProviderStatus


class AgentProgress(StrictBaseModel):
    agent: str
    status: str
    detail: str


class EvidenceItem(StrictBaseModel):
    file_path: str = Field(description="Repository relative path.")
    snippet: str
    reason: str


class Finding(StrictBaseModel):
    id: str
    source_agent: str
    severity: str
    title: str
    explanation: str
    recommendation: str
    evidence: list[EvidenceItem]


class RejectedFinding(StrictBaseModel):
    id: str
    title: str
    rejection_reason: str
    source_agent: str


class GraphPosition(StrictBaseModel):
    x: float
    y: float


class GraphNodeData(StrictBaseModel):
    label: str
    kind: str
    description: str | None = None


class GraphNode(StrictBaseModel):
    id: str
    type: str = "default"
    position: GraphPosition
    data: GraphNodeData


class GraphEdge(StrictBaseModel):
    id: str
    source: str
    target: str
    label: str | None = None


class FileSummary(StrictBaseModel):
    path: str
    content_summary: str
    language: str
    sha: str | None = None
    size: int | None = None


class RepoFile(StrictBaseModel):
    path: str
    type: str
    sha: str | None = None
    size: int | None = None


class RepositoryMetadata(StrictBaseModel):
    owner: str
    name: str
    full_name: str
    default_branch: str
    description: str | None = None
    primary_language: str | None = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    topics: list[str] = Field(default_factory=list)


class ShortlistCandidate(StrictBaseModel):
    path: str
    reason: str
    score: int


class AgentContext(StrictBaseModel):
    focus: str
    strategy: str
    target_paths: list[str]
    shortlist: list[ShortlistCandidate]
    file_summaries: list[FileSummary]


class AgentContextMap(StrictBaseModel):
    architecture: AgentContext
    security: AgentContext
    qa: AgentContext
    performance: AgentContext


class ContextOptimization(StrictBaseModel):
    cached_summary_hits: int
    generated_summary_count: int
    shortlisted_file_count: int


class RepositoryContext(StrictBaseModel):
    repository_url: str
    source_type: str = "github"
    local_root_path: str | None = None
    metadata: RepositoryMetadata
    readme: str
    manifests: list[FileSummary]
    representative_files: list[FileSummary]
    structure: list[RepoFile]
    condensed_summary: str
    agent_contexts: AgentContextMap
    optimization: ContextOptimization
