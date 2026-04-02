import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const surfaceVariants = {
  hero: "surface surface-hero",
  elevated: "surface surface-elevated",
  subtle: "surface surface-subtle",
  interactive: "surface surface-interactive",
  metric: "surface surface-metric",
  code: "surface surface-code",
  detail: "surface surface-subtle detail-card",
  mission: "surface surface-interactive mission-card",
  ops: "surface surface-elevated ops-card",
  panel: "surface surface-elevated panel",
  panelStrong: "surface surface-hero panel panel-strong",
  prompt: "surface surface-code prompt-card",
  quickRef: "surface surface-interactive quick-ref-card",
  role: "surface surface-interactive role-card",
  reference: "surface surface-subtle reference-card",
  signal: "surface surface-subtle signal-card",
  skill: "surface surface-interactive skill-card",
  stat: "surface surface-metric stat-card",
  timeline: "surface surface-subtle timeline-card",
  tool: "surface surface-elevated surface-tool tool-card",
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
