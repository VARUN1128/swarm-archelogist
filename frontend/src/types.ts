export type Severity = "critical" | "high" | "medium" | "low";

export interface EvidenceItem {
  file_path: string;
  snippet: string;
  reason: string;
}

export interface Finding {
  id: string;
  source_agent: string;
  severity: Severity;
  title: string;
  explanation: string;
  recommendation: string;
  evidence: EvidenceItem[];
}

export interface RejectedFinding {
  id: string;
  title: string;
  rejection_reason: string;
  source_agent: string;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    kind: string;
    description?: string | null;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string | null;
}

export interface FileSummary {
  path: string;
  content_summary: string;
  language: string;
}

export interface RepoFile {
  path: string;
  type: string;
  sha?: string | null;
  size?: number | null;
}

export interface RepositoryMetadata {
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  description?: string | null;
  primary_language?: string | null;
  stars: number;
  forks: number;
  open_issues: number;
  topics: string[];
}

export interface RepositoryContext {
  repository_url: string;
  metadata: RepositoryMetadata;
  readme: string;
  manifests: FileSummary[];
  representative_files: FileSummary[];
  structure: RepoFile[];
  condensed_summary: string;
}

export interface AgentProgress {
  agent: string;
  status: string;
  detail: string;
}

export interface ArchitectureReport {
  summary: string;
  detected_stack: string[];
  key_components: string[];
  component_relationships: string[];
  graph_nodes: GraphNode[];
  graph_edges: GraphEdge[];
}

export interface SpecialistReport {
  summary: string;
  findings: Finding[];
}

export interface StaffEngineerReview {
  approved_findings: Finding[];
  rejected_findings: RejectedFinding[];
  critical_findings: Finding[];
  priority_ranking: string[];
  engineering_reasoning: string;
}

export interface AnalyzeRepositoryResponse {
  repository_context: RepositoryContext;
  progress: AgentProgress[];
  architecture_report: ArchitectureReport;
  security_report: SpecialistReport;
  qa_report: SpecialistReport;
  performance_report: SpecialistReport;
  staff_engineer_review: StaffEngineerReview;
}

export interface PatchProposal {
  file: string;
  issue: string;
  explanation: string;
  patch_diff: string;
  impact: string;
  risk: string;
  change_type: string;
  original_content: string;
  proposed_content: string;
}

export interface PatchValidationIssue {
  patch_file: string;
  message: string;
}

export interface PatchValidationReport {
  valid: boolean;
  issues: PatchValidationIssue[];
}

export interface GenerateFixesResponse {
  patches: PatchProposal[];
  validation_report: PatchValidationReport;
}

export interface PullRequestDraft {
  title: string;
  summary: string;
  modified_files: string[];
  impact: string;
  risk_assessment: string;
  engineering_rationale: string;
  markdown: string;
}

export interface GeneratePRResponse {
  pr_draft: PullRequestDraft;
}

export interface AnalysisJobStartResponse {
  job_id: string;
  status: string;
  progress: AgentProgress[];
}

export interface AnalysisJobStatusResponse {
  job_id: string;
  status: string;
  progress: AgentProgress[];
  result?: AnalyzeRepositoryResponse | null;
  error?: string | null;
}

export interface AppliedPatchResult {
  file: string;
  status: string;
  action: string;
  message: string;
  backup_path?: string | null;
}

export interface ApplyPatchesReport {
  target_root_path: string;
  applied_count: number;
  skipped_count: number;
  results: AppliedPatchResult[];
}

export interface ApplyApprovedPatchesResponse {
  report: ApplyPatchesReport;
}
