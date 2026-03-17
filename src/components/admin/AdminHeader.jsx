import { Menu, PanelLeftClose, PanelLeftOpen, Radio, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatWeather(adminWeather) {
  if (!adminWeather || adminWeather.loading) {
    return "Weather loading...";
  }

  if (adminWeather.temperature == null) {
    return adminWeather.label || "Weather unavailable";
  }

  return `${Math.round(adminWeather.temperature)} C | ${adminWeather.label}`;
}

export default function AdminHeader({
  section,
  adminName,
  adminRole,
  adminNow,
  adminWeather,
  loadingDashboard,
  autoRefreshEnabled,
  onRefresh,
  onToggleAutoRefresh,
  onOpenSidebar,
  collapsed,
  onToggleCollapse,
  lastRefreshedAt
}) {
  return (
    <header className="border-b border-line/60 bg-panel/76 px-3 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button className="lg:hidden" type="button" variant="outline" size="icon" onClick={onOpenSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button className="hidden lg:inline-flex" type="button" variant="outline" size="icon" onClick={onToggleCollapse}>
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-deep/70">Admin workspace</p>
              <h2 className="mt-2 font-display text-2xl leading-none text-ink sm:text-4xl">{section.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{section.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button type="button" variant="outline" size="icon" onClick={onRefresh} title="Refresh dashboard">
              <RefreshCw className={`h-4 w-4 ${loadingDashboard ? "animate-spin" : ""}`} />
            </Button>
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="outline"
              onClick={onToggleAutoRefresh}
              title="Toggle live updates"
            >
              <Radio className="mr-2 h-4 w-4" />
              {autoRefreshEnabled ? "Live on" : "Live off"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex rounded-full border border-brand/25 bg-brand/10 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-brand-deep">
            {adminName || "Admin"}
          </span>
          <span className="rounded-full border border-line/70 bg-panel-strong/60 px-3 py-1 font-semibold text-ink">
            {String(adminRole || "ops").replace(/-/g, " ")}
          </span>
          <span className="rounded-full border border-line/70 bg-panel-strong/60 px-3 py-1 font-semibold text-ink">
            {adminNow.toLocaleDateString()}
          </span>
          <span className="rounded-full border border-line/70 bg-panel-strong/60 px-3 py-1 font-semibold text-ink">
            {adminNow.toLocaleTimeString()}
          </span>
          <span className="max-w-full truncate rounded-full border border-line/70 bg-panel-strong/60 px-3 py-1 font-semibold text-ink sm:max-w-[18rem]">
            {formatWeather(adminWeather)}
          </span>
          <span className="w-full rounded-full border border-line/70 bg-panel-strong/60 px-3 py-1 font-semibold text-ink-soft sm:w-auto">
            Last refreshed: {lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : "Not yet"}
          </span>
        </div>
      </div>
    </header>
  );
}
