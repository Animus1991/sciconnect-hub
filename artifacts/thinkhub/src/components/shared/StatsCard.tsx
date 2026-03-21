import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  color?: string;
  className?: string;
}

export function StatsCard({ label, value, sub, icon: Icon, color = "text-foreground", className }: StatsCardProps) {
  return (
    <div className={cn("bg-card rounded-xl border border-border p-4", className)}>
      {Icon && <Icon className={`w-4 h-4 mb-2 ${color}`} />}
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      <p className="text-xs font-display font-medium text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground font-display">{sub}</p>}
    </div>
  );
}
