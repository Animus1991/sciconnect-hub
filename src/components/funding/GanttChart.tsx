import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GanttMilestone {
  id: string;
  title: string;
  due: string;
  status: "done" | "in_progress" | "upcoming";
  projectId?: string;
}

interface GanttChartProps {
  milestones: GanttMilestone[];
  startDate: string;
  endDate: string;
  projectMap?: Record<string, string>;
}

const STATUS_COLORS: Record<string, string> = {
  done: "bg-emerald-500",
  in_progress: "bg-amber-500",
  upcoming: "bg-muted-foreground/30",
};

export function GanttChart({ milestones, startDate, endDate, projectMap = {} }: GanttChartProps) {
  const { totalDays, monthLabels, projectRows } = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const total = Math.max(1, Math.ceil((end - start) / 86400000));

    // Generate month labels
    const labels: { label: string; leftPct: number }[] = [];
    const d = new Date(startDate);
    d.setDate(1);
    while (d.getTime() <= end) {
      const pct = ((d.getTime() - start) / (end - start)) * 100;
      if (pct >= 0 && pct <= 100) {
        labels.push({ label: d.toLocaleString("en", { month: "short", year: "2-digit" }), leftPct: pct });
      }
      d.setMonth(d.getMonth() + 3);
    }

    // Group milestones by project
    const groups: Record<string, GanttMilestone[]> = {};
    milestones.forEach(m => {
      const key = m.projectId || "__general__";
      (groups[key] ||= []).push(m);
    });

    const rows = Object.entries(groups).map(([key, items]) => ({
      projectId: key,
      projectName: key === "__general__" ? "General" : (projectMap[key] || key),
      milestones: items.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()),
    }));

    return { totalDays: total, monthLabels: labels, projectRows: rows };
  }, [milestones, startDate, endDate, projectMap]);

  if (milestones.length === 0) return null;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const todayPct = ((Date.now() - start) / (end - start)) * 100;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-display font-semibold text-foreground">Milestone Timeline</h4>

      {/* Timeline header */}
      <div className="relative h-6 bg-secondary/30 rounded-t-lg border border-border overflow-hidden">
        {monthLabels.map((m, i) => (
          <span key={i} className="absolute top-1 text-[9px] text-muted-foreground font-display" style={{ left: `${m.leftPct}%` }}>
            {m.label}
          </span>
        ))}
        {todayPct > 0 && todayPct < 100 && (
          <div className="absolute top-0 bottom-0 w-px bg-primary/60 z-10" style={{ left: `${todayPct}%` }}>
            <span className="absolute -top-0.5 -translate-x-1/2 text-[8px] text-primary font-display font-bold">Now</span>
          </div>
        )}
      </div>

      {/* Rows */}
      <TooltipProvider>
        <div className="space-y-1">
          {projectRows.map(row => (
            <div key={row.projectId} className="flex items-center gap-2">
              <span className="text-[10px] font-display text-muted-foreground w-28 truncate flex-shrink-0 text-right">
                {row.projectName}
              </span>
              <div className="relative flex-1 h-7 bg-secondary/20 rounded border border-border/50">
                {/* Track line */}
                {row.milestones.length >= 2 && (() => {
                  const firstPct = ((new Date(row.milestones[0].due).getTime() - start) / (end - start)) * 100;
                  const lastPct = ((new Date(row.milestones[row.milestones.length - 1].due).getTime() - start) / (end - start)) * 100;
                  return (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-1 bg-border rounded-full"
                      style={{ left: `${Math.max(0, firstPct)}%`, width: `${Math.min(100, lastPct) - Math.max(0, firstPct)}%` }}
                    />
                  );
                })()}
                {/* Milestone dots */}
                {row.milestones.map(m => {
                  const pct = ((new Date(m.due).getTime() - start) / (end - start)) * 100;
                  if (pct < 0 || pct > 100) return null;
                  return (
                    <Tooltip key={m.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background cursor-pointer transition-transform hover:scale-150 ${STATUS_COLORS[m.status]}`}
                          style={{ left: `${pct}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{m.title}</p>
                        <p className="text-muted-foreground">{m.due} · {m.status.replace("_", " ")}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {/* Today marker */}
                {todayPct > 0 && todayPct < 100 && (
                  <div className="absolute top-0 bottom-0 w-px bg-primary/40" style={{ left: `${todayPct}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-display">
        {[
          { status: "done", label: "Done" },
          { status: "in_progress", label: "In Progress" },
          { status: "upcoming", label: "Upcoming" },
        ].map(l => (
          <span key={l.status} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[l.status]}`} /> {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
