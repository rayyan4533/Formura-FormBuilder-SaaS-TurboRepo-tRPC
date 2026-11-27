import { DashboardHamburgerToggle } from "~/components/dashboard-sidebar";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-2">
        <DashboardHamburgerToggle className="mt-1 md:hidden" />
        <div className="min-w-0">
          <h1 className="font-display text-4xl leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}
