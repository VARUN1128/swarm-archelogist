import type { WorkspaceSection } from "@/components/workspace-sidebar";

export function workspaceSectionPath(section: WorkspaceSection, mode: "workspace" | "session" | "shared" = "workspace", id?: string) {
  if (mode === "session" && id) {
    return `/sessions/${id}/${section}`;
  }
  if (mode === "shared" && id) {
    return `/shared/${id}/${section}`;
  }
  return `/workspace/${section}`;
}

export const homePath = "/home";

export const workspaceSectionPaths: Record<WorkspaceSection, string> = {
  overview: workspaceSectionPath("overview"),
  architecture: workspaceSectionPath("architecture"),
  security: workspaceSectionPath("security"),
  qa: workspaceSectionPath("qa"),
  performance: workspaceSectionPath("performance"),
  staff: workspaceSectionPath("staff"),
  patches: workspaceSectionPath("patches"),
  pr: workspaceSectionPath("pr"),
};

export function pathToWorkspaceSection(pathname: string): WorkspaceSection | null {
  const parts = pathname.split("/").filter(Boolean);
  const candidate = parts[parts.length - 1];
  const entry = Object.entries(workspaceSectionPaths).find(([section]) => section === candidate);
  return (entry?.[0] as WorkspaceSection | undefined) ?? null;
}
