// No "use client" here: server components call buttonClass too.
import { cn } from "~/lib/utils";

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50";

export const buttonVariants = {
  primary: "bevel border border-ink bg-primary text-primary-foreground [--bevel-light:rgb(255_255_255/0.35)] [--bevel-dark:rgb(0_0_0/0.35)] hover:brightness-110",
  outline: "bevel border border-ink bg-card text-foreground hover:bg-muted dark:border-input",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "text-destructive hover:bg-destructive/10",
};

export const buttonSizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "size-8",
};

export function buttonClass(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "md",
  className?: string,
) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}
