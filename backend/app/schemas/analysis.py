from app.schemas.common import Finding, GraphEdge, GraphNode, RejectedFinding, StrictBaseModel


class ArchitectureReport(StrictBaseModel):
    summary: str
    detected_stack: list[str]
    key_components: list[str]
    component_relationships: list[str]
    graph_nodes: list[GraphNode]
    graph_edges: list[GraphEdge]


class SecurityReport(StrictBaseModel):
    summary: str
    findings: list[Finding]


class QAReport(StrictBaseModel):
    summary: str
    findings: list[Finding]


class PerformanceReport(StrictBaseModel):
    summary: str
    findings: list[Finding]


class StaffEngineerReview(StrictBaseModel):
    approved_findings: list[Finding]
    rejected_findings: list[RejectedFinding]
    critical_findings: list[Finding]
    priority_ranking: list[str]
    engineering_reasoning: str
