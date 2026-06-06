import type { WorkspaceSection } from "@/components/workspace-sidebar";

export const workspaceSectionPaths: Record<WorkspaceSection, string> = {
  overview: "/workspace/overview",
  architecture: "/workspace/architecture",
  security: "/workspace/security",
  qa: "/workspace/qa",
  performance: "/workspace/performance",
  staff: "/workspace/staff",
  patches: "/workspace/patches",
  pr: "/workspace/pr",
};

export function pathToWorkspaceSection(pathname: string): WorkspaceSection | null {
  const entry = Object.entries(workspaceSectionPaths).find(([, path]) => path === pathname);
  return (entry?.[0] as WorkspaceSection | undefined) ?? null;
}
