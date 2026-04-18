import { Button } from "@/components/ui/button";
import {
  DetailRow,
  EmptyState,
  SectionHeading,
  StatusPill,
  Surface
} from "@/components/site/shared";
import { formatCurrency } from "@/lib/site";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/components/admin/admin-config";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function BookingsSection() {
  const {
    dashboard,
    pendingApprovalBookings,
    approvedBookings,
    bookingActionBusyById,
    saveBooking,
    focusedBooking,
    setFocusedBookingId,
    setBookingSearch,
    setBookingStatusFilter,
    setBookingsPage,
    bookingSearch,
    bookingStatusFilter,
    bookingDateFilter,
    setBookingDateFilter,
    bulkBookingStatus,
    setBulkBookingStatus,
    applyBulkBookingStatus,
    loadingDashboard,
    selectedBookingCount,
    bookingSlice,
    selectedBookingIds,
    setSelectedBookingIds,
    toggleSelection,
    viewMode,
    renderBookingReplyComposer,
    bookingPages,
    bookingsPage
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/30 bg-panel/88 shadow-xl">
        <SectionHeading
          eyebrow="Bookings"
          title="Booking management"
          description="Approve appointments, filter the queue, and respond to customers without leaving the workflow."
        />

        <div className="grid gap-4 rounded-[1.2rem] border border-line/70 bg-panel/85 p-4 xl:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-warning/35 bg-warning/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">Pending approval</p>
              <StatusPill value={`${pendingApprovalBookings.length} pending`} />
            </div>
            {pendingApprovalBookings.length === 0 ? (
              <p className="text-xs text-ink-soft">No booking is waiting for approval.</p>
            ) : (
              pendingApprovalBookings.slice(0, 4).map((item) => {
                const bookingId = String(item.id || "");
                const actionBusy = Boolean(bookingActionBusyById[bookingId]);

                return (
                  <div key={`pending-approval-${item.id}`} className="rounded-lg border border-warning/30 bg-panel/92 p-3">
                    <p className="text-sm font-semibold text-ink">{item.name || "Customer"}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {item.serviceName || "Service"} | {item.date || ""} {item.time || ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => saveBooking(item.id, "approved", { source: "approval-queue" })}
                        disabled={actionBusy}
                      >
                        {actionBusy ? "Approving..." : "Approve booking"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFocusedBookingId(String(item.id || ""));
                          setBookingSearch(String(item.name || item.phone || item.id || ""));
                          setBookingStatusFilter("all");
                          setBookingsPage(1);
                        }}
                      >
                        Open details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-success/35 bg-success/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">Approved bookings</p>
              <StatusPill value={`${approvedBookings.length} approved`} />
            </div>
            {approvedBookings.length === 0 ? (
              <p className="text-xs text-ink-soft">Approved bookings will appear here.</p>
            ) : (
              approvedBookings.slice(0, 4).map((item) => (
                <div key={`approved-booking-${item.id}`} className="rounded-lg border border-success/30 bg-panel/92 p-3">
                  <p className="text-sm font-semibold text-ink">{item.name || "Customer"}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {item.serviceName || "Service"} | {item.date || ""} {item.time || ""}
                  </p>
                  <p className="mt-1 text-[11px] text-success">Approved by admin workflow</p>
                </div>
              ))
            )}
          </div>
        </div>

        {focusedBooking ? (
          <div className="rounded-[1.2rem] border border-brand/35 bg-panel/90 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">Booker details</p>
              <div className="flex items-center gap-2">
                <StatusPill value={focusedBooking.status || "pending"} />
                <Button type="button" variant="outline" onClick={() => setFocusedBookingId("")}>
                  Close details
                </Button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              <DetailRow label="Booking ID" value={focusedBooking.id || "N/A"} />
              <DetailRow label="Name" value={focusedBooking.name || "N/A"} />
              <DetailRow label="Email" value={focusedBooking.email || "N/A"} />
              <DetailRow label="Phone" value={focusedBooking.phone || "N/A"} />
              <DetailRow label="Service" value={focusedBooking.serviceName || "N/A"} />
              <DetailRow label="Scheduled" value={`${focusedBooking.date || ""} ${focusedBooking.time || ""}`.trim() || "N/A"} />
              <DetailRow label="Payment method" value={focusedBooking.paymentMethod || "N/A"} />
              <DetailRow label="Amount due now" value={formatCurrency(focusedBooking.amountDueNow || 0)} />
              {focusedBooking.serviceMode === "home" ? (
                <DetailRow label="Home address" value={focusedBooking.homeServiceAddress || "N/A"} />
              ) : null}
              {focusedBooking.homeServiceMapLink ? (
                <DetailRow
                  label="Map"
                  value={<a className="text-brand underline-offset-4 hover:underline" href={focusedBooking.homeServiceMapLink} target="_blank" rel="noreferrer">Open current location</a>}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-3">
          <input
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            placeholder="Search by name, phone, service, ID"
            value={bookingSearch}
            onChange={(event) => setBookingSearch(event.target.value)}
          />
          <select
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={bookingStatusFilter}
            onChange={(event) => setBookingStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BOOKING_STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={bookingDateFilter}
            onChange={(event) => setBookingDateFilter(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span className="inline-flex rounded-full bg-panel px-3 py-1 font-semibold tracking-[0.15em] text-ink-soft">Quick filters</span>
          <Button type="button" variant="outline" onClick={() => { setBookingStatusFilter("pending"); setBookingsPage(1); }}>
            Pending
          </Button>
          <Button type="button" variant="outline" onClick={() => { setBookingStatusFilter("approved"); setBookingsPage(1); }}>
            Approved
          </Button>
          <Button type="button" variant="outline" onClick={() => { setBookingStatusFilter("completed"); setBookingsPage(1); }}>
            Completed
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setBookingStatusFilter("all");
              setBookingDateFilter("");
              setBookingSearch("");
              setBookingsPage(1);
            }}
          >
            Reset filters
          </Button>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            className="w-full sm:w-auto"
            type="button"
            variant="outline"
            onClick={() => {
              const pageIds = bookingSlice.map((item) => item.id);
              const hasUnselected = pageIds.some((id) => !selectedBookingIds.includes(id));
              setSelectedBookingIds((prev) =>
                hasUnselected ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id))
              );
            }}
          >
            {bookingSlice.some((item) => !selectedBookingIds.includes(item.id)) ? "Select page" : "Unselect page"}
          </Button>
          <select
            className="h-11 w-full rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink sm:w-auto"
            value={bulkBookingStatus}
            onChange={(event) => setBulkBookingStatus(event.target.value)}
          >
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {BOOKING_STATUS_LABELS[status] || status}
              </option>
            ))}
          </select>
          <Button className="w-full sm:w-auto" type="button" onClick={applyBulkBookingStatus} disabled={loadingDashboard || !selectedBookingCount}>
            Apply to {selectedBookingCount || 0} booking(s)
          </Button>
        </div>

        {bookingSlice.length === 0 ? <EmptyState title="No bookings yet" description="Bookings will appear here as customers submit requests." /> : null}

        {viewMode === "cards" ? (
          <div className="space-y-3">
            {bookingSlice.map((item) => (
              <div key={item.id} className="rounded-[1.4rem] border border-line/70 bg-panel/92 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex min-w-0 items-center gap-3">
                    <input type="checkbox" checked={selectedBookingIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedBookingIds)} />
                    <p className="min-w-0 break-words font-semibold text-ink">{item.name}</p>
                  </label>
                  <StatusPill value={item.status} />
                </div>
                <div className="mt-3 space-y-2">
                  <DetailRow label="Service" value={item.serviceName} />
                  <DetailRow label="When" value={`${item.date} ${item.time}`} />
                  <DetailRow label="Email" value={item.email || "N/A"} />
                  <DetailRow label="Phone" value={item.phone || "N/A"} />
                  <DetailRow label="Due now" value={formatCurrency(item.amountDueNow)} />
                  {item.serviceMode === "home" ? (
                    <DetailRow label="Home address" value={item.homeServiceAddress || "N/A"} />
                  ) : null}
                  {item.homeServiceMapLink ? (
                    <DetailRow
                      label="Map"
                      value={<a className="text-brand underline-offset-4 hover:underline" href={item.homeServiceMapLink} target="_blank" rel="noreferrer">Open current location</a>}
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    className="h-11 flex-1 rounded-[1.4rem] border border-line bg-panel/92 px-4 text-ink"
                    value={item.status}
                    onChange={(event) => saveBooking(item.id, event.target.value)}
                  >
                    {BOOKING_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {BOOKING_STATUS_LABELS[status] || status}
                      </option>
                    ))}
                  </select>
                </div>
                {renderBookingReplyComposer(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {bookingSlice.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-[1.1rem] border border-line/70 bg-panel/92 p-3 lg:grid-cols-[auto,minmax(0,1fr),auto,auto] lg:items-center">
                <input type="checkbox" checked={selectedBookingIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedBookingIds)} />
                <div className="min-w-0">
                  <p className="break-words font-semibold text-ink">{item.name} | {item.serviceName}</p>
                  <p className="break-words text-sm text-ink-soft">{item.date} {item.time} | {formatCurrency(item.amountDueNow)}</p>
                  <p className="break-words text-xs text-ink-soft">{item.email || "N/A"} | {item.phone || "N/A"}</p>
                </div>
                <StatusPill value={item.status} />
                <select
                  className="h-10 w-full rounded-[0.9rem] border border-line bg-panel/92 px-3 text-sm text-ink lg:w-auto"
                  value={item.status}
                  onChange={(event) => saveBooking(item.id, event.target.value)}
                >
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {BOOKING_STATUS_LABELS[status] || status}
                    </option>
                    ))}
                </select>
                <div className="lg:col-span-4">{renderBookingReplyComposer(item)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-stretch gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={bookingsPage === 1} onClick={() => setBookingsPage(bookingsPage - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-soft">
            Page {bookingsPage} of {bookingPages}
          </span>
          <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={bookingsPage >= bookingPages} onClick={() => setBookingsPage(bookingsPage + 1)}>
            Next
          </Button>
        </div>

        <div className="rounded-[1.2rem] border border-line/70 bg-panel/88 px-4 py-3 text-sm text-ink-soft">
          Total bookings loaded: <strong className="text-ink">{dashboard.bookings.length}</strong>
        </div>
      </Surface>
    </div>
  );
}
