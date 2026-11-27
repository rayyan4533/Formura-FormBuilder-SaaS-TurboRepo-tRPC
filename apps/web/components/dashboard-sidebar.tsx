"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Menu,
  X,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useUser } from "~/hooks/api/auth";
import { Button, Logo, ThemeToggle } from "~/components/ui/kit";
import { cn } from "~/lib/utils";

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileOpen: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleMobileOpen = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        mobileOpen,
        setMobileOpen,
        toggleMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
      toggleMobileOpen: () => {},
    };
  }
  return context;
}

export function DashboardHamburgerToggle({ className = "" }: { className?: string }) {
  const { mobileOpen, toggleMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMobileOpen}
      className={className}
      title={mobileOpen ? "Close menu" : "Open menu"}
      aria-label="Toggle dashboard menu"
    >
      {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
    </Button>
  );
}

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Forms", href: "/dashboard/forms", icon: FileText, exact: false },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { isCollapsed, toggleSidebar, mobileOpen, setMobileOpen } = useSidebar();
  // The builder needs the width for its three panes, so the rail starts narrow there.
  const isBuilder = /^\/dashboard\/forms\/[^/]+$/.test(pathname);
  const [expandedInBuilder, setExpandedInBuilder] = useState(false);

  const renderNav = (collapsed: boolean, onToggle: () => void) => (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background p-3 transition-[width] duration-200",
        collapsed ? "w-[60px] items-center" : "w-56",
      )}
    >
      <div className={cn("mb-6 flex h-8 items-center", collapsed ? "justify-center" : "justify-between pl-1")}>
        <Logo href="/dashboard" compact={collapsed} />
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden md:inline-flex"
            title="Collapse side panel"
            aria-label="Toggle side panel"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex w-full flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map(({ name, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? name : undefined}
              aria-label={name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors",
                collapsed && "justify-center",
                active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && name}
            </Link>
          );
        })}
      </nav>

      <div className={cn("flex w-full flex-col gap-1", collapsed && "items-center")}>
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={onToggle} title="Expand side panel" aria-label="Toggle side panel">
            <PanelLeftOpen className="size-4" />
          </Button>
        )}
        <ThemeToggle />
        <div className={cn("flex items-center gap-2.5 border-t pt-3", collapsed && "justify-center")}>
          <span className="flex size-8 shrink-0 items-center justify-center border border-brand bg-brand-soft text-[13px] font-medium text-brand">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="size-4" />}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{user?.fullName || "Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const collapsed = isBuilder ? !expandedInBuilder : isCollapsed;
  const onToggle = isBuilder ? () => setExpandedInBuilder((v) => !v) : toggleSidebar;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen shrink-0 md:block">{renderNav(collapsed, onToggle)}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full shadow-xl">{renderNav(false, () => setMobileOpen(false))}</div>
        </div>
      )}
    </>
  );
}
