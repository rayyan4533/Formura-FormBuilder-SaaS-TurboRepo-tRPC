import type { Metadata } from "next";
import { DashboardSidebar, SidebarProvider } from "~/components/dashboard-sidebar";

export const metadata: Metadata = {
  title: { default: "Overview", template: "%s · Formura" },
  description: "Your recent forms and responses.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
