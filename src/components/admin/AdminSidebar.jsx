import { Link, NavLink } from "react-router-dom";
import {
  Globe2,
  LogOut,
  RefreshCw,
  Radio,
  X
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatWeather(adminWeather) {
  if (!adminWeather || adminWeather.loading) {
    return "Weather loading...";
  }

  if (adminWeather.temperature == null) {
    return adminWeather.label || "Weather unavailable";
  }

  return `${Math.round(adminWeather.temperature)} C | ${adminWeather.label}`;
}

export default function AdminSidebar({
  items,
  counts,
  queueCount,
  adminName,
  adminRole,
  adminNow,
  adminWeather,
  loadingDashboard,
  autoRefreshEnabled,
  onRefresh,
  onToggleAutoRefresh,
  onSignOut,
  lastRefreshedAt,
  mobileOpen,
  collapsed,
  onClose
}) {
  const compact = collapsed && !mobileOpen;
  const sidebarActionClassName =
    "inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-line/70 bg-panel/82 px-3 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-panel-strong/65";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-night/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-line/70 bg-linear-to-b from-panel/98 via-panel/95 to-panel-strong/82 text-ink shadow-[0_28px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl transition-all duration-300 lg:static lg:inset-auto lg:z-auto lg:h-full lg:max-w-none lg:translate-x-0 lg:rounded-none lg:border-0 lg:border-r lg:border-line/60 lg:shadow-none",
          "dark:border-white/10 dark:from-night/92 dark:via-panel/92 dark:to-night/84 dark:text-white dark:shadow-[0_28px_80px_rgba(2,6,23,0.4)]",
          mobileOpen ? "translate-x-0" : "-translate-x-[115%] lg:translate-x-0",
          compact ? "w-[5.75rem] lg:w-full" : "w-[19rem] lg:w-full"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line/60 px-4 py-5 dark:border-white/10">
          <div className={cn("min-w-0", compact ? "lg:text-center" : "")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-brand-deep/70 dark:text-brand-soft/72">
              Aura salon
            </p>
            <h1 className={cn("mt-2 font-display text-2xl text-ink dark:text-white", compact ? "lg:hidden" : "")}>
              Admin
            </h1>
            <p className={cn("mt-2 text-sm leading-6 text-ink-soft dark:text-white/68", compact ? "lg:hidden" : "")}>
              Navigation and command actions now live in one collapsible rail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="lg:hidden" type="button" variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4">
          <div className={cn("rounded-[1.35rem] border border-line/70 bg-panel/84 px-3 py-3 dark:border-white/10 dark:bg-white/6", compact ? "lg:px-2" : "")}>
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft dark:text-white/55", compact ? "lg:text-center" : "")}>
              Queue
            </p>
            <p className={cn("mt-2 text-2xl font-semibold text-ink dark:text-white", compact ? "lg:text-center" : "")}>{queueCount}</p>
            <p className={cn("mt-1 text-xs text-ink-soft dark:text-white/65", compact ? "lg:hidden" : "")}>
              pending bookings and orders
            </p>
          </div>

          <div className={cn("rounded-[1.35rem] border border-line/70 bg-panel/84 px-3 py-3 dark:border-white/10 dark:bg-white/6", compact ? "lg:px-2" : "")}>
            <p className={cn("text-sm font-semibold text-ink dark:text-white", compact ? "lg:text-center" : "")}>{adminName || "Admin"}</p>
            <p className={cn("mt-1 text-xs uppercase tracking-[0.18em] text-ink-soft dark:text-white/55", compact ? "lg:text-center" : "")}>
              {String(adminRole || "ops").replace(/-/g, " ")}
            </p>
            <div className={cn("mt-3 space-y-1 text-xs text-ink-soft dark:text-white/65", compact ? "lg:hidden" : "")}>
              <p>{adminNow.toLocaleDateString()}</p>
              <p>{adminNow.toLocaleTimeString()}</p>
              <p>{formatWeather(adminWeather)}</p>
            </div>
          </div>

          <nav className={cn("space-y-2.5", compact ? "lg:flex lg:flex-col lg:items-center lg:space-y-3" : "")}>
            {items.map((item) => {
              const Icon = item.icon;
              const badge = counts[item.key];

              return (
                <NavLink
                  key={item.key}
                  to={`/admin/${item.path}`}
                  className={({ isActive }) =>
                    cn(
                      "group flex min-w-0 items-center gap-3 rounded-[1.2rem] border px-3 py-2.5 transition-all duration-200 sm:py-3",
                      compact ? "lg:w-16 lg:justify-center lg:self-center lg:px-0 lg:py-4" : "",
                      isActive
                        ? "border-brand/30 bg-brand/12 text-ink shadow-[0_14px_32px_rgba(217,119,6,0.14)] dark:border-brand-soft/28 dark:bg-white/12 dark:text-white dark:shadow-[0_14px_32px_rgba(2,6,23,0.24)]"
                        : "border-line/70 bg-panel/70 text-ink-soft hover:border-brand/20 hover:bg-panel hover:text-ink dark:border-white/8 dark:bg-white/4 dark:text-white/72 dark:hover:border-white/16 dark:hover:bg-white/8 dark:hover:text-white"
                    )
                  }
                  onClick={onClose}
                  title={item.title}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line/70 bg-panel-strong/55 dark:border-white/10 dark:bg-white/8",
                          compact ? "lg:h-12 lg:w-12" : "",
                          isActive ? "text-brand-deep dark:text-brand-soft" : "text-ink-soft dark:text-white/72"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <div className={cn("min-w-0 flex-1", compact ? "lg:hidden" : "")}>
                        <div className="flex items-center justify-between gap-3">
                          <p className={cn("truncate text-sm font-semibold", isActive ? "text-ink dark:text-white" : "")}>{item.title}</p>
                          {badge != null ? (
                            <span className="inline-flex min-w-7 shrink-0 items-center justify-center rounded-full bg-panel-strong/80 px-2 py-1 text-[11px] font-semibold text-ink-soft dark:bg-white/14 dark:text-white/80">
                              {badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className={cn("mt-auto border-t border-line/60 py-4 dark:border-white/10", compact ? "px-2" : "px-3")}>
          <div
            className={cn(
              "rounded-[1.35rem] border border-line/70 bg-panel/84 px-3 py-3 dark:border-white/10 dark:bg-white/6",
              compact ? "px-1.5 py-2.5" : ""
            )}
          >
            <div className={cn("flex items-center gap-2", compact ? "lg:justify-center" : "justify-between")}>
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft dark:text-white/55", compact ? "lg:hidden" : "")}>
                Controls
              </p>
              <ThemeToggle compact={compact} />
            </div>

            <div className={cn("mt-3 grid gap-2", compact ? "lg:grid-cols-1" : "grid-cols-2")}>
              <button type="button" className={sidebarActionClassName} onClick={onRefresh} title="Refresh dashboard">
                <RefreshCw className={cn("h-4 w-4", loadingDashboard ? "animate-spin" : "")} />
                <span className={compact ? "lg:hidden" : ""}>{loadingDashboard ? "Refreshing" : "Refresh"}</span>
              </button>
              <button type="button" className={sidebarActionClassName} onClick={onToggleAutoRefresh} title="Toggle live updates">
                <Radio className="h-4 w-4" />
                <span className={compact ? "lg:hidden" : ""}>{autoRefreshEnabled ? "Live on" : "Live off"}</span>
              </button>
              <Link to="/" className={sidebarActionClassName} onClick={onClose} title="View website">
                <Globe2 className="h-4 w-4" />
                <span className={compact ? "lg:hidden" : ""}>Website</span>
              </Link>
              <button type="button" className={sidebarActionClassName} onClick={onSignOut} title="Sign out">
                <LogOut className="h-4 w-4" />
                <span className={compact ? "lg:hidden" : ""}>Sign out</span>
              </button>
            </div>
          </div>

          {!compact ? (
            <p className="mt-3 text-xs text-ink-soft dark:text-white/55">
              Last refreshed: {lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : "Not yet"}
            </p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
