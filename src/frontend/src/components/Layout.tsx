import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Globe, LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/scanner", label: "Scanner", icon: ScanSearch },
  { path: "/strength", label: "Strength", icon: Globe },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/settings", label: "Settings", icon: Settings },
] as const;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <nav
        className={`flex flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}
      >
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          {!collapsed && (
            <span className="font-display font-bold text-primary text-lg tracking-tight">
              FX Pro
            </span>
          )}
          <button
            type="button"
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <span className="text-xs">{collapsed ? "▶" : "◀"}</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-1 p-2">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-border">
          {!collapsed && (
            <p className="text-xs text-muted-foreground">Scanner v2.0</p>
          )}
        </div>
      </nav>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
