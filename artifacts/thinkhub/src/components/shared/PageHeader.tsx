import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeaderBadge {
  label: string;
  icon?: LucideIcon;
  className?: string;
}

interface PageHeaderProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  badge?: PageHeaderBadge;
  actions?: React.ReactNode;
  className?: string;
  meta?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconClassName,
  title,
  description,
  badge,
  actions,
  className,
  meta,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start justify-between gap-4 mb-5", className)}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-accent/10", iconClassName)}>
            <Icon className="w-4.5 h-4.5 text-accent" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[22px] font-semibold text-foreground leading-snug tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                "bg-secondary text-muted-foreground border-border",
                badge.className
              )}>
                {badge.icon && <badge.icon className="w-3 h-3" />}
                {badge.label}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[13px] text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          )}
          {meta && <div className="mt-1">{meta}</div>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
