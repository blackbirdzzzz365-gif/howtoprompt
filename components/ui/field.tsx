import type {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("field", className)} {...props}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

export function FieldGroup({
  label,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLLabelElement> & {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={cn("field-group", className)} {...props}>
      <span className="micro-label">{label}</span>
      {children}
    </label>
  );
}

export function InputField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input-field", className)} {...props} />;
}

export function SelectField({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("select", className)} {...props} />;
}

export function TextareaField({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("textarea-field", className)} {...props} />;
}

export function PromptTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("textarea", className)} {...props} />;
}
