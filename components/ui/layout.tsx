import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type LayoutTag = "div" | "section";

export function PageSection({
  as = "section",
  strong = false,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: LayoutTag;
  strong?: boolean;
}) {
  const Tag = as;
  return <Tag className={cn("panel", "section-block", strong && "panel-strong", className)} {...props} />;
}

export function DetailPageLayout({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div className={cn("detail-grid", className)} {...props}>
      {children}
    </div>
  );
}

export function DetailPairGrid({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div className={cn("detail-grid", "detail-grid-tight", className)} {...props}>
      {children}
    </div>
  );
}

export function StickyAside({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
}) {
  return (
    <aside className={cn("tool-stack", "sticky-console", className)} {...props}>
      {children}
    </aside>
  );
}
