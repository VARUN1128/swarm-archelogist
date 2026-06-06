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
        <div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg">
          <div className="font-semibold">{String(node.data.label ?? node.id)}</div>
          <div className="mt-1 text-xs text-slate-400">{String(node.data.kind ?? "component")}</div>
        </div>
      ),
    },
  }));

  const edges = report.graph_edges.map((edge) => ({
    ...edge,
    animated: true,
    style: { stroke: "#77c5ff", strokeOpacity: 0.85 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
  }));

  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Architecture Graph</h3>
        <p className="mt-1 text-sm text-slate-300">{report.summary}</p>
      </div>
      <div className="h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-[#040b14]">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <MiniMap pannable zoomable style={{ background: "#08111d" }} />
          <Controls />
          <Background color="#11324d" gap={24} />
        </ReactFlow>
      </div>
    </Card>
  );
}
