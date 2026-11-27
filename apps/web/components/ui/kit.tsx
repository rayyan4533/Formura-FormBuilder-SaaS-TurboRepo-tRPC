"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "~/lib/utils";
import { buttonClass, type buttonSizes, type buttonVariants } from "~/components/ui/button-class";

export { buttonClass };

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export const inputClass =
  "sunken w-full border border-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: React.ReactNode;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
      {children}
    </div>
  );
}

export function Window({
  title,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("window", className)}>
      <div className="titlebar" aria-hidden>
        <span className="size-3.5 shrink-0 border border-ink bg-card dark:border-input" />
        <span className="mx-auto max-w-[70%] truncate bg-card px-3 font-mono text-xs">{title}</span>
        <span className="size-3.5 shrink-0" />
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Formura">
      <span className="flex size-7 items-center justify-center border border-ink bg-primary font-display text-lg leading-none text-primary-foreground">
        F
      </span>
      {!compact && <span className="font-display text-[22px] leading-none">Formura</span>}
    </Link>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
    >
      {/* Both icons render and CSS picks one, so server and client markup match. */}
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  );
}
