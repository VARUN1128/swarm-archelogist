import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Card } from "@/components/ui/card";
import type { ArchitectureReport } from "@/types";

interface ArchitectureGraphProps {
  report: ArchitectureReport;
}

export function ArchitectureGraph({ report }: ArchitectureGraphProps) {
  const nodes = report.graph_nodes.map((node) => ({
    ...node,
    data: {
      label: (
        <div className="border border-border bg-background px-3 py-2 text-sm text-foreground shadow-none">
          <div className="font-semibold">{String(node.data.label ?? node.id)}</div>
          <div className="mt-1 text-xs text-muted">{String(node.data.kind ?? "component")}</div>
        </div>
      ),
    },
  }));

  const edges = report.graph_edges.map((edge) => ({
    ...edge,
    animated: true,
    style: { stroke: "#9ca3af", strokeOpacity: 0.9 },
    labelStyle: { fill: "#6b7280", fontSize: 12 },
  }));

  return (
    <Card className="border-border bg-card p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Architecture Graph</h3>
        <p className="mt-1 text-sm leading-7 text-muted">{report.summary}</p>
      </div>
      <div className="h-[360px] overflow-hidden border border-border bg-background md:h-[440px]">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <MiniMap pannable zoomable style={{ background: "#f3f4f6" }} />
          <Controls />
          <Background color="#d1d5db" gap={24} />
        </ReactFlow>
      </div>
    </Card>
  );
}
