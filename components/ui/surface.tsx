import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const surfaceVariants = {
  detail: "detail-card",
  mission: "mission-card",
  ops: "ops-card",
  panel: "panel",
  panelStrong: "panel panel-strong",
  prompt: "prompt-card",
  quickRef: "quick-ref-card",
  role: "role-card",
  reference: "reference-card",
  signal: "signal-card",
  skill: "skill-card",
  stat: "stat-card",
  timeline: "timeline-card",
  tool: "tool-card",
} as const;

type SurfaceVariant = keyof typeof surfaceVariants;
type SurfaceTag = "article" | "aside" | "div" | "section";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: SurfaceTag;
  variant: SurfaceVariant;
};

export function Surface({
  as = "div",
  variant,
  className,
  ...props
}: SurfaceProps) {
  const Tag = as;
  return <Tag className={cn(surfaceVariants[variant], className)} {...props} />;
}
