import { useEffect, useState } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdminSection } from "@/components/admin/admin-config";

const SIDEBAR_STORAGE_KEY = "ceo-admin-sidebar-collapsed";

export default function AdminLayout({
  activeSection,
  sections,
  counts,
  queueCount,
  adminName,
  adminRole,
  adminNow,
  adminWeather,
  loadingDashboard,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onSignOut,
  lastRefreshedAt,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const currentSection = getAdminSection(activeSection);
  const sidebarWidth = sidebarCollapsed ? "5.75rem" : "19rem";

  return (
    <div
      className="min-h-[100dvh] lg:min-h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-3rem)]"
      style={{ "--admin-sidebar-width": sidebarWidth }}
    >
      <div className="grid h-full min-h-[100dvh] overflow-hidden rounded-[1.5rem] border border-white/35 bg-panel/90 shadow-[0_24px_72px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:rounded-[2rem] lg:min-h-0 lg:grid-cols-[var(--admin-sidebar-width)_minmax(0,1fr)]">
        <AdminSidebar
          items={sections}
          counts={counts}
          queueCount={queueCount}
          adminName={adminName}
          adminRole={adminRole}
          adminNow={adminNow}
          adminWeather={adminWeather}
          loadingDashboard={loadingDashboard}
          autoRefreshEnabled={autoRefreshEnabled}
          onRefresh={onRefresh}
          onToggleAutoRefresh={onToggleAutoRefresh}
          onSignOut={onSignOut}
          lastRefreshedAt={lastRefreshedAt}
          mobileOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AdminHeader
              section={currentSection}
              adminName={adminName}
              adminRole={adminRole}
              adminNow={adminNow}
              adminWeather={adminWeather}
              loadingDashboard={loadingDashboard}
              autoRefreshEnabled={autoRefreshEnabled}
              onRefresh={onRefresh}
              onToggleAutoRefresh={onToggleAutoRefresh}
              onOpenSidebar={() => setSidebarOpen(true)}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
              lastRefreshedAt={lastRefreshedAt}
            />

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
