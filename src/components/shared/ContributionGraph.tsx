/**
 * ContributionGraph — GitHub-style research activity heatmap
 * Ported & adapted from AI_ORGANIZER_VITE ContributionGraph.tsx
 * Uses SciConnect's Tailwind + shadcn/ui design system
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionGraphProps {
  data?: ContributionDay[];
  title?: string;
  subtitle?: string;
  colorScheme?: "gold" | "emerald" | "blue" | "purple";
  weeks?: number;
}

const COLOR_SCHEMES: Record<string, string[]> = {
  gold:    ["bg-border/50", "bg-amber-300/30 dark:bg-amber-900/40", "bg-amber-400/55 dark:bg-amber-700/55", "bg-amber-500/80 dark:bg-amber-500/70", "bg-amber-500 dark:bg-amber-400"],
  emerald: ["bg-border/50", "bg-emerald-300/30 dark:bg-emerald-900/40", "bg-emerald-400/55 dark:bg-emerald-700/55", "bg-emerald-500/80 dark:bg-emerald-500/70", "bg-emerald-500 dark:bg-emerald-400"],
  blue:    ["bg-border/50", "bg-blue-300/30 dark:bg-blue-900/40", "bg-blue-400/55 dark:bg-blue-700/55", "bg-blue-500/80 dark:bg-blue-500/70", "bg-blue-500 dark:bg-blue-400"],
  purple:  ["bg-border/50", "bg-purple-300/30 dark:bg-purple-900/40", "bg-purple-400/55 dark:bg-purple-700/55", "bg-purple-500/80 dark:bg-purple-500/70", "bg-purple-500 dark:bg-purple-400"],
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function generateResearchActivity(numDays = 365): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;

    const activeProb = isWeekend ? 0.28 : 0.62;
    let count = 0;
    if (Math.random() < activeProb) {
      const r = Math.random();
      count = r < 0.45 ? 1 : r < 0.72 ? 2 : r < 0.90 ? 3 : 4;
    }
    days.push({ date: d.toISOString().split("T")[0], count });
  }
  return days;
}

export function ContributionGraph({
  data,
  title = "Research Activity",
  subtitle,
  colorScheme = "gold",
  weeks = 52,
}: ContributionGraphProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);

  const activityData = useMemo(() => data ?? generateResearchActivity(weeks * 7), [data, weeks]);
  const totalContributions = useMemo(() => activityData.reduce((s, d) => s + d.count, 0), [activityData]);

  // Build grid: columns = weeks, rows = days (Sun=0 → Sat=6)
  const grid = useMemo(() => {
    const start = new Date(activityData[0]?.date ?? new Date());
    const paddingDays = start.getDay(); // align to Sunday

    const padded: ContributionDay[] = Array.from({ length: paddingDays }, (_, idx) => {
      const d = new Date(start);
      d.setDate(d.getDate() - paddingDays + idx);
      return { date: d.toISOString().split("T")[0], count: -1 };
    });

    const all = [...padded, ...activityData];
    const cols: ContributionDay[][] = [];
    for (let i = 0; i < all.length; i += 7) {
      cols.push(all.slice(i, i + 7));
    }
    return cols;
  }, [activityData]);

  // Month label positions
  const monthPositions = useMemo(() => {
    const seen = new Set<string>();
    const positions: { label: string; col: number }[] = [];
    grid.forEach((week, col) => {
      for (const day of week) {
        if (day.count < 0) continue;
        const ym = day.date.substring(0, 7);
        if (!seen.has(ym)) {
          seen.add(ym);
          const mIdx = parseInt(day.date.substring(5, 7)) - 1;
          positions.push({ label: MONTH_LABELS[mIdx], col });
        }
        break;
      }
    });
    return positions;
  }, [grid]);

  const colors = COLOR_SCHEMES[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-5"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-semibold text-sm text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {subtitle ?? `${totalContributions} contributions in the last year`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground font-display">Less</span>
          {colors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-muted-foreground font-display">More</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-block">
          {/* Month row */}
          <div className="flex ml-[26px] mb-1 gap-[3px]">
            {grid.map((_, col) => {
              const mp = monthPositions.find(m => m.col === col);
              return (
                <div key={col} className="w-[13px] shrink-0 text-[9px] text-muted-foreground leading-none font-mono">
                  {mp?.label ?? ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1.5">
              {DAY_LABELS.map((lbl, i) => (
                <div key={i} className="h-[13px] text-[9px] text-muted-foreground leading-none flex items-center font-mono w-4">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day, di) => {
                    if (day.count < 0) return <div key={di} className="w-[13px] h-[13px]" />;
                    const level = Math.min(day.count, 4);
                    return (
                      <div
                        key={di}
                        className={`w-[13px] h-[13px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-accent/50 ${colors[level]}`}
                        onMouseEnter={() => setTooltip({ date: day.date, count: day.count })}
                        onMouseLeave={() => setTooltip(null)}
                        title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 text-[11px] text-center text-muted-foreground font-display">
          <span className="text-foreground font-medium">{tooltip.count}</span> contribution{tooltip.count !== 1 ? "s" : ""} on{" "}
          {new Date(tooltip.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}
    </motion.div>
  );
}
