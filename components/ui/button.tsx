import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost",
  nav: "nav-link",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className?: string) {
  return cn(buttonVariants[variant], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  className?: string;
};

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}
