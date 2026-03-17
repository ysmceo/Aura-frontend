import { Button } from "@/components/ui/button";
import {
  SectionHeading,
  Surface,
  TextField
} from "@/components/site/shared";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function SettingsSection() {
  const {
    feeForm,
    setFeeForm,
    saveFees,
    savingFees,
    viewMode,
    setViewMode,
    autoRefreshEnabled,
    toggleAutoRefresh,
    exportBookingsCsv,
    exportOrdersCsv,
    dashboard
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/30 bg-panel/88 shadow-xl">
        <SectionHeading
          eyebrow="Configuration"
          title="Settings"
          description="Update delivery fees and workspace behavior without leaving the admin shell."
        />

        <div className="grid gap-6 2xl:grid-cols-2">
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <p className="text-sm font-semibold text-ink">Delivery fees</p>
            <p className="mt-1 text-sm text-ink-soft">Adjust the fees used across the order workflow.</p>

            <form className="mt-4 space-y-4" onSubmit={saveFees}>
              <div className="grid gap-4 lg:grid-cols-2">
                <TextField
                  label="Standard fee"
                  id="fee-standard"
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={feeForm.standard}
                  onChange={(event) => setFeeForm((prev) => ({ ...prev, standard: event.target.value }))}
                />
                <TextField
                  label="Express fee"
                  id="fee-express"
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={feeForm.express}
                  onChange={(event) => setFeeForm((prev) => ({ ...prev, express: event.target.value }))}
                />
              </div>
              <Button className="w-full sm:w-auto" type="submit" disabled={savingFees}>
                {savingFees ? "Saving fees..." : "Save fees"}
              </Button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
              <p className="text-sm font-semibold text-ink">Workspace preferences</p>
              <p className="mt-1 text-sm text-ink-soft">Choose the default list density and refresh style for the admin workspace.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button className="w-full sm:w-auto" type="button" variant={viewMode === "cards" ? "default" : "outline"} onClick={() => setViewMode("cards")}>
                  Cards view
                </Button>
                <Button className="w-full sm:w-auto" type="button" variant={viewMode === "compact" ? "default" : "outline"} onClick={() => setViewMode("compact")}>
                  Compact view
                </Button>
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={toggleAutoRefresh}>
                  Live updates: {autoRefreshEnabled ? "On" : "Off"}
                </Button>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
              <p className="text-sm font-semibold text-ink">Exports</p>
              <p className="mt-1 text-sm text-ink-soft">Download the currently filtered operational datasets when you need offline review.</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={exportBookingsCsv}>
                  Export bookings CSV
                </Button>
                <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={exportOrdersCsv}>
                  Export orders CSV
                </Button>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
              <p className="text-sm font-semibold text-ink">Current inventory</p>
              <p className="mt-1 text-sm text-ink-soft">
                Products published: <strong className="text-ink">{dashboard.products.length}</strong>
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Messages tracked: <strong className="text-ink">{dashboard.messages.length}</strong>
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </div>
  );
}
