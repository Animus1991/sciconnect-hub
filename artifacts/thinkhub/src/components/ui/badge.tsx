import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border border-border/50 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20",
        outline: "border border-border bg-transparent text-foreground",
        success: "border border-success/20 bg-success/10 text-success",
        warning: "border border-warning/20 bg-warning/10 text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
