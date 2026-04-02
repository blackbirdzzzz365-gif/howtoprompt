import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const chipVariants = {
  solid: "chip",
  outline: "outline-chip",
  status: "status-chip",
} as const;

export type ChipVariant = keyof typeof chipVariants;

export function chipClassName(variant: ChipVariant = "solid", className?: string) {
  return cn(chipVariants[variant], className);
}

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ChipVariant;
};

export function Chip({ variant = "solid", className, ...props }: ChipProps) {
  return <span className={chipClassName(variant, className)} {...props} />;
}
