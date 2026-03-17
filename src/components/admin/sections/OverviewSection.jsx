import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DetailRow,
  EmptyState,
  SectionHeading,
  StatCard,
  StatusPill,
  Surface
} from "@/components/site/shared";
import { formatCurrency } from "@/lib/site";
import { ORDER_STATUS_FLOW_TEXT } from "@/components/admin/admin-config";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function OverviewSection() {
  const {
    dashboard,
    pendingBookings,
    pendingOrders,
    unreadMessagesCount,
    dueNowTotal,
    orderRevenueTotal,
    lastRefreshedAt,
    loadingDashboard,
    refreshDashboard,
    focusPendingBookings,
    focusPendingOrders,
    focusUnreadMessages,
    focusProductsManagement,
    operationsBookingApprovalRate,
    averageOrderValue,
    executiveHealthSignal,
    autoRefreshEnabled,
    operationsDate,
    setOperationsDate,
    operationsChairCapacity,
    setOperationsChairCapacity,
    operationsStaffInput,
    setOperationsStaffInput,
    operationsDateBookings,
    operationsDateOrders,
    operationsDateMessages,
    operationsCompletionRate,
    slotLoadSummary,
    operationsStaffOptions,
    operationsAssignmentValidation,
    bookingAssignments,
    assignmentNotifyBusyByBookingId,
    recentlyApprovedBookingIds,
    updateBookingAssignment,
    notifyBookingAssignment,
    todayDateKey,
    formatRelativeTime,
    operationsRevenue,
    customerPulse,
    adminIdentity,
    adminRole,
    adminNow,
    adminWeather,
    canViewModerationAudit,
    moderationActivityCount,
    loadingModerationAudit,
    moderationAuditLogs,
    overduePendingCount,
    viewMode,
    setViewMode,
    exportBookingsCsv,
    exportOrdersCsv,
    newRequestEntries,
    newRequestPages,
    newRequestSlice,
    newRequestsPage,
    setNewRequestsPage,
    newRequestsPageSize,
    setNewRequestsPageSize,
    selectedBookingIds,
    setSelectedBookingIds,
    selectedOrderIds,
    setSelectedOrderIds,
    toggleSelection,
    renderBookingReplyComposer,
    renderOrderContactActions,
    renderOrderReplyComposer,
    saveOrder,
    orderActionBusyById,
    normalizeStatus,
    setOrderSearch,
    setOrderStatusFilter,
    setOrderDateFilter,
    setOrdersPage
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/35 bg-linear-to-r from-panel/96 via-panel/92 to-panel-strong/84 shadow-xl">
        <SectionHeading
          eyebrow="Command center"
          title="Daily command panel"
          description="One place to monitor queue pressure, surface bottlenecks, and jump into the right workflow."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Pending bookings</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{pendingBookings.length}</p>
            <p className="mt-1 text-xs text-ink-soft">needs approval</p>
          </div>
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Pending orders</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{pendingOrders.length}</p>
            <p className="mt-1 text-xs text-ink-soft">needs dispatch</p>
          </div>
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Unread messages</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{unreadMessagesCount}</p>
            <p className="mt-1 text-xs text-ink-soft">customer inbox</p>
          </div>
          <div className="rounded-[1.35rem] border border-line/70 bg-panel/92 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Order value</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{formatCurrency(orderRevenueTotal)}</p>
            <p className="mt-1 text-xs text-ink-soft">current total</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusPendingBookings}>
            Open booking queue
          </Button>
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusPendingOrders}>
            Open order queue
          </Button>
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusUnreadMessages}>
            Open message queue
          </Button>
          <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={refreshDashboard}>
            {loadingDashboard ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="rounded-[1.2rem] border border-line/70 bg-panel/88 px-4 py-3 text-sm leading-6 text-ink-soft">
          Active section: <strong className="text-ink">Overview</strong> | Last refreshed:{" "}
          {lastRefreshedAt ? new Date(lastRefreshedAt).toLocaleString() : "Not yet"}
        </div>
      </Surface>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <div className="min-w-0 space-y-6">
          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Quick actions"
              title="Daily execution"
              description="Move directly into the workflow that needs attention."
            />
            <div className="flex flex-wrap gap-2">
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusPendingBookings}>
                Pending bookings ({pendingBookings.length})
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusPendingOrders}>
                Pending orders ({pendingOrders.length})
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusUnreadMessages}>
                Unread messages ({unreadMessagesCount})
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={focusProductsManagement}>
                Manage products
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              <span className="inline-flex rounded-full bg-panel px-3 py-1 font-semibold tracking-[0.15em] text-ink-soft">
                SERVICE QUALITY
              </span>
              <span>
                Overdue pending items (&gt;24h):{" "}
                <strong className={overduePendingCount > 0 ? "text-warning" : "text-success"}>{overduePendingCount}</strong>
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-ink-soft/60 sm:inline-block" />
              <span>
                Queue now: <strong className="text-ink">{pendingBookings.length + pendingOrders.length}</strong>
              </span>
            </div>
          </Surface>

          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Executive strip"
              title="Operational indicators"
              description="Compact KPIs for throughput, value, and queue health."
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-line/70 bg-panel/92 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Booking approval rate (day)</p>
                <p className="mt-1 text-lg font-semibold text-ink">{operationsBookingApprovalRate}%</p>
              </div>
              <div className="rounded-xl border border-line/70 bg-panel/92 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Average order value</p>
                <p className="mt-1 text-lg font-semibold text-ink">{formatCurrency(averageOrderValue)}</p>
              </div>
              <div className="rounded-xl border border-line/70 bg-panel/92 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Queue health</p>
                <p className={`mt-1 text-lg font-semibold ${executiveHealthSignal.tone}`}>{executiveHealthSignal.label}</p>
              </div>
              <div className="rounded-xl border border-line/70 bg-panel/92 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Automation</p>
                <p className="mt-1 text-lg font-semibold text-ink">{autoRefreshEnabled ? "Auto-refreshing" : "Manual refresh"}</p>
              </div>
            </div>
          </Surface>

          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Operations board"
              title="Calendar execution and floor planning"
              description="Track daily bookings, staffing assignments, chair load, and order activity."
            />

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
              <div className="w-full sm:w-auto">
                <label htmlFor="operations-date" className="mb-2 block text-sm font-semibold text-ink">
                  Operations date
                </label>
                <input
                  id="operations-date"
                  type="date"
                  className="h-11 w-full rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink sm:w-[12rem]"
                  value={operationsDate}
                  onChange={(event) => setOperationsDate(event.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <label htmlFor="operations-chairs" className="mb-2 block text-sm font-semibold text-ink">
                  Chair capacity
                </label>
                <input
                  id="operations-chairs"
                  type="number"
                  min={1}
                  className="h-11 w-full rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink sm:w-28"
                  value={operationsChairCapacity}
                  onChange={(event) => setOperationsChairCapacity(Math.max(1, Number(event.target.value) || 1))}
                />
              </div>
              <div className="min-w-0 flex-1 basis-full lg:basis-[18rem]">
                <label htmlFor="operations-staff" className="mb-2 block text-sm font-semibold text-ink">
                  Staff roster (comma separated)
                </label>
                <input
                  id="operations-staff"
                  type="text"
                  className="h-11 w-full rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
                  value={operationsStaffInput}
                  onChange={(event) => setOperationsStaffInput(event.target.value)}
                  placeholder="Amina, Tunde, Grace"
                />
              </div>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setOperationsDate(todayDateKey())}>
                Jump to today
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              <StatCard label="Bookings (day)" value={operationsDateBookings.length} />
              <StatCard label="Orders (day)" value={operationsDateOrders.length} />
              <StatCard label="Messages (day)" value={operationsDateMessages.length} />
              <StatCard label="Completion" value={`${operationsCompletionRate}%`} helper="approved/completed throughput" />
              <StatCard
                label="Peak slot load"
                value={`${slotLoadSummary.peakSlotLoad}/${Math.max(1, operationsChairCapacity)}`}
                helper={slotLoadSummary.peakSlotTime === "--" ? "no active slot" : `${slotLoadSummary.peakSlotTime} | ${slotLoadSummary.peakUtilization}% utilized`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              <span className="inline-flex rounded-full bg-panel px-3 py-1 font-semibold tracking-[0.15em] text-ink-soft">
                FLOOR LOAD
              </span>
              <span>
                Current staff listed: <strong className="text-ink">{operationsStaffOptions.length}</strong>
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-ink-soft/60 sm:inline-block" />
              <span>
                Peak slot utilization:{" "}
                <strong
                  className={
                    slotLoadSummary.peakUtilization > 100
                      ? "text-danger"
                      : slotLoadSummary.peakUtilization >= 85
                        ? "text-warning"
                        : "text-success"
                  }
                >
                  {slotLoadSummary.peakUtilization}%
                </strong>
              </span>
            </div>

            <div
              className={`rounded-2xl border px-3 py-2 text-xs leading-6 ${
                operationsAssignmentValidation.isHealthy
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-warning/40 bg-warning/10 text-warning"
              }`}
            >
              {operationsAssignmentValidation.isHealthy
                ? "Assignment validation: all bookings have valid staff/chair allocations for their time slots."
                : `Assignment validation: ${operationsAssignmentValidation.bookingsWithIssues} booking(s) need attention | missing=${operationsAssignmentValidation.missingAssignments} | staff conflicts=${operationsAssignmentValidation.staffConflicts} | chair conflicts=${operationsAssignmentValidation.chairConflicts}`}
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              <div className="min-w-0 rounded-[1.2rem] border border-line/70 bg-panel/90 p-4">
                <p className="text-sm font-semibold text-ink">Appointment timeline</p>
                <div className="mt-3 space-y-2">
                  {operationsDateBookings.length === 0 ? (
                    <EmptyState title="No bookings on this date" description="Select another date to inspect salon appointment flow." />
                  ) : (
                    operationsDateBookings.map((item) => {
                      const bookingId = String(item.id || "");
                      const assignment = bookingAssignments[bookingId] || {};
                      const bookingIssues = operationsAssignmentValidation.issuesByBookingId[bookingId] || [];
                      const notifyBusy = Boolean(assignmentNotifyBusyByBookingId[bookingId]);
                      const isRecentlyApproved = Boolean(recentlyApprovedBookingIds[bookingId]);
                      const bookingStatus = String(item?.status || "").trim().toLowerCase();
                      const hasAutoActionBadge = Boolean(item?.lastAssignment?.autoApproved);
                      const autoApprovedAtLabel = hasAutoActionBadge && item?.lastAssignment?.autoApprovedAt
                        ? new Date(String(item.lastAssignment.autoApprovedAt)).toLocaleString()
                        : "";
                      const autoApprovedRelativeLabel = hasAutoActionBadge && item?.lastAssignment?.autoApprovedAt
                        ? formatRelativeTime(item.lastAssignment.autoApprovedAt)
                        : "";

                      return (
                        <div
                          key={`ops-booking-${item.id}`}
                          className={`rounded-xl border bg-panel/92 p-3 transition-all duration-500 ${
                            isRecentlyApproved
                              ? "border-success/70 ring-2 ring-success/40 shadow-lg shadow-success/20"
                              : "border-line/70"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-ink">
                              {item.time || "--:--"} | {item.name || "Customer"}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              {hasAutoActionBadge ? (
                                <span className="inline-flex rounded-full border border-success/35 bg-success/15 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-success">
                                  AUTO ACTION PERFORMED
                                </span>
                              ) : null}
                              <StatusPill value={item.status || "pending"} />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-ink-soft">
                            {item.serviceName || "Service"} | {item.phone || item.email || "No contact"}
                          </p>
                          {hasAutoActionBadge && autoApprovedAtLabel ? (
                            <p className="mt-1 text-[11px] text-success/85" title={`Auto-approved at ${autoApprovedAtLabel}`}>
                              Auto-approved {autoApprovedRelativeLabel || "just now"}
                            </p>
                          ) : null}
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <select
                              className="h-10 rounded-xl border border-line bg-panel/92 px-3 text-xs text-ink"
                              value={assignment.staff || ""}
                              onChange={(event) => updateBookingAssignment(item, "staff", event.target.value)}
                            >
                              <option value="">Assign staff</option>
                              {operationsStaffOptions.map((staff) => (
                                <option key={`${item.id}-${staff}`} value={staff}>
                                  {staff}
                                </option>
                              ))}
                            </select>
                            <select
                              className="h-10 rounded-xl border border-line bg-panel/92 px-3 text-xs text-ink"
                              value={assignment.chair || ""}
                              onChange={(event) => updateBookingAssignment(item, "chair", event.target.value)}
                            >
                              <option value="">Assign chair</option>
                              {Array.from({ length: Math.max(1, operationsChairCapacity) }, (_, index) => index + 1).map((chairNo) => (
                                <option key={`${item.id}-chair-${chairNo}`} value={String(chairNo)}>
                                  Chair {chairNo}
                                </option>
                              ))}
                            </select>
                          </div>
                          {bookingIssues.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {bookingIssues.map((issue) => (
                                <span key={`${item.id}-${issue}`} className="inline-flex rounded-full bg-warning/15 px-2 py-1 text-[10px] font-semibold text-warning">
                                  {issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] text-success">Assignment valid for this booking.</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={notifyBusy || !assignment.staff || !assignment.chair}
                              onClick={() => notifyBookingAssignment(item)}
                            >
                              {notifyBusy
                                ? "Sending notice..."
                                : ["pending", "new"].includes(bookingStatus)
                                  ? "Assign + Notify + Approve"
                                  : "Assign + Notify"}
                            </Button>
                          </div>
                          {["pending", "new"].includes(bookingStatus) ? (
                            <p className="mt-2 text-[11px] text-ink-soft">
                              Tip: selecting both staff and chair auto-runs Assign + Notify + Approve.
                            </p>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-[1.2rem] border border-line/70 bg-panel/90 p-4">
                <p className="text-sm font-semibold text-ink">Order fulfillment timeline</p>
                <div className="mt-3 space-y-2">
                  {operationsDateOrders.length === 0 ? (
                    <div className="rounded-xl border border-line/70 bg-panel/92 p-4">
                      <p className="text-sm font-semibold text-ink">No orders found for this date</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {new Date(`${operationsDate}T00:00:00`).toLocaleDateString()} | Orders created on this date will appear here in dispatch sequence.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-lg border border-line/70 bg-panel px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Orders (date)</p>
                          <p className="mt-1 text-sm font-semibold text-ink">0</p>
                        </div>
                        <div className="rounded-lg border border-line/70 bg-panel px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Pending dispatch</p>
                          <p className="mt-1 text-sm font-semibold text-ink">0</p>
                        </div>
                        <div className="rounded-lg border border-line/70 bg-panel px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Revenue (date)</p>
                          <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(0)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={() => setOperationsDate(todayDateKey())}>
                          View today
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            focusPendingOrders();
                            setOrderStatusFilter("pending");
                            setOrderDateFilter(operationsDate);
                            setOrdersPage(1);
                          }}
                        >
                          Open pending orders
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            focusPendingOrders();
                            setOrderStatusFilter("all");
                            setOrderDateFilter("");
                            setOrdersPage(1);
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    </div>
                  ) : (
                    operationsDateOrders.map((item) => (
                      <div key={`ops-order-${item.id}`} className="rounded-xl border border-line/70 bg-panel/92 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">
                            {item.orderCode || item.id} | {item.name || "Customer"}
                          </p>
                          <StatusPill value={item.status || "pending"} />
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">
                          {formatCurrency(item.totalAmount || 0)} | {item.deliverySpeed || "standard"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
              <span className="inline-flex rounded-full bg-panel px-3 py-1 font-semibold tracking-[0.15em] text-ink-soft">
                DAILY REVENUE SIGNAL
              </span>
              <span>
                Estimated booked/order value: <strong className="text-ink">{formatCurrency(operationsRevenue)}</strong>
              </span>
            </div>
          </Surface>
          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Incoming work"
              title="New bookings and orders"
              description="Review newly submitted requests before moving into the full workflow."
            />

            {newRequestEntries.length > 0 ? (
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
                <label className="text-sm text-ink-soft" htmlFor="new-requests-page-size">
                  Per page
                </label>
                <select
                  id="new-requests-page-size"
                  className="h-10 rounded-2xl border border-line bg-panel/92 px-3 text-sm text-ink"
                  value={newRequestsPageSize}
                  onChange={(event) => setNewRequestsPageSize(Number(event.target.value) || 8)}
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-3">
              {newRequestEntries.length === 0 ? <EmptyState title="No new bookings or orders" description="All caught up." /> : null}
              {newRequestSlice.map((entry) => {
                if (entry.kind === "booking") {
                  const item = entry.data;
                  return (
                    <div key={`new-booking-${item.id}`} className="rounded-[1.4rem] border border-brand/25 bg-panel/92 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="inline-flex items-center gap-3">
                          <input type="checkbox" checked={selectedBookingIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedBookingIds)} />
                          <p className="font-semibold text-ink">{item.name}</p>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-danger px-2 py-1 text-[10px] font-extrabold tracking-[0.18em] text-white">
                            NEW
                          </span>
                          <StatusPill value={item.status} />
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <DetailRow label="Service" value={item.serviceName} />
                        <DetailRow label="When" value={`${item.date} ${item.time}`} />
                        <DetailRow label="Email" value={item.email || "N/A"} />
                        <DetailRow label="Phone" value={item.phone || "N/A"} />
                        <DetailRow label="Due now" value={formatCurrency(item.amountDueNow)} />
                      </div>
                      {renderBookingReplyComposer(item)}
                    </div>
                  );
                }

                const item = entry.data;
                const currentOrderStatus = normalizeStatus(item.status);
                const orderActionBusy = Boolean(orderActionBusyById[String(item.id) || ""]);
                const customerStatusEmailAt = item?.lastStatusEmailSentAt ? new Date(item.lastStatusEmailSentAt).toLocaleString() : "";

                return (
                  <div key={`new-order-${item.id}`} className="rounded-[1.4rem] border border-brand-deep/25 bg-panel/92 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex items-center gap-3">
                        <input type="checkbox" checked={selectedOrderIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedOrderIds)} />
                        <p className="font-semibold text-ink">{item.orderCode}</p>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-danger px-2 py-1 text-[10px] font-extrabold tracking-[0.18em] text-white">
                          NEW
                        </span>
                        <StatusPill value={item.status} />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <DetailRow label="Customer" value={item.name} />
                      <DetailRow label="Email" value={item.email || "N/A"} />
                      <DetailRow label="Phone" value={item.phone || "N/A"} />
                      <DetailRow label="Delivery speed" value={item.deliverySpeed} />
                      <DetailRow label="Total" value={formatCurrency(item.totalAmount)} />
                    </div>
                    <div className="mt-3 rounded-xl border border-line/70 bg-panel/85 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Standard order flow</p>
                      <p className="mt-1 text-xs text-ink-soft">{ORDER_STATUS_FLOW_TEXT}</p>
                      {customerStatusEmailAt ? (
                        <p className="mt-1 text-xs text-success">Customer status email last sent: {customerStatusEmailAt}</p>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() => saveOrder(item.id, "approved", { source: "queue" })}
                        disabled={orderActionBusy || ["approved", "processed", "shipped", "on_the_way", "delivered"].includes(currentOrderStatus)}
                      >
                        {orderActionBusy ? "Updating..." : "Approve order"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => saveOrder(item.id, "cancelled", { source: "queue" })}
                        disabled={orderActionBusy || currentOrderStatus === "cancelled"}
                      >
                        Cancel order
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          focusPendingOrders();
                          setOrderSearch(String(item.orderCode || item.id || ""));
                          setOrderStatusFilter("all");
                          setOrdersPage(1);
                        }}
                      >
                        Open full workflow
                      </Button>
                    </div>
                    {renderOrderContactActions(item)}
                    {renderOrderReplyComposer(item)}
                  </div>
                );
              })}

              {newRequestEntries.length > 0 ? (
                <div className="flex flex-col items-stretch gap-3 pt-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={newRequestsPage === 1} onClick={() => setNewRequestsPage(newRequestsPage - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-ink-soft">
                    Page {newRequestsPage} of {newRequestPages}
                  </span>
                  <Button
                    className="w-full sm:w-auto"
                    type="button"
                    variant="outline"
                    disabled={newRequestsPage >= newRequestPages}
                    onClick={() => setNewRequestsPage(newRequestsPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </div>
          </Surface>
        </div>
        <div className="min-w-0 space-y-6">
          <Surface className="space-y-4 border-white/35 bg-linear-to-b from-panel/95 to-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Insights"
              title="Executive pulse"
              description="Compact operational context for faster decisions."
            />

            <div className="space-y-3">
              <div className="rounded-xl border border-brand/18 bg-linear-to-br from-panel/96 to-panel-strong/78 p-3 shadow-sm shadow-brand/8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Access</p>
                <p className="mt-1 text-sm font-semibold text-ink">{adminIdentity?.name || "Admin"}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                  {adminRole.replace(/-/g, " ")} | {adminNow.toLocaleTimeString()}
                </p>
                <p className="mt-2 text-[11px] text-ink-soft">
                  {adminWeather.loading
                    ? "Weather loading..."
                    : adminWeather.temperature != null
                      ? `${Math.round(adminWeather.temperature)} C | ${adminWeather.label}`
                      : adminWeather.label}
                </p>
              </div>

              <div className="rounded-xl border border-brand/18 bg-linear-to-br from-panel/96 to-panel-strong/78 p-3 shadow-sm shadow-brand/8">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Operations pulse</p>
                  <span className={`text-xs font-semibold ${executiveHealthSignal.tone}`}>{executiveHealthSignal.label}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-line/70 bg-panel/95 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Overdue</p>
                    <p className="text-sm font-semibold text-ink">{overduePendingCount}</p>
                  </div>
                  <div className="rounded-lg border border-line/70 bg-panel/95 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">Auto mode</p>
                    <p className="text-sm font-semibold text-ink">{autoRefreshEnabled ? "On" : "Off"}</p>
                  </div>
                </div>
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-soft">
                  <Users className="h-3.5 w-3.5" />
                  {autoRefreshEnabled ? "Auto refresh enabled" : "Manual monitoring"}
                </p>
              </div>

              <div className="rounded-xl border border-brand/18 bg-linear-to-br from-panel/96 to-panel-strong/78 p-3 shadow-sm shadow-brand/8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Top customer</p>
                {customerPulse.length === 0 ? (
                  <p className="mt-1 text-xs text-ink-soft">No customer activity yet.</p>
                ) : (
                  <div className="mt-2 rounded-lg border border-line/70 bg-panel/95 px-2 py-1.5">
                    <p className="text-xs font-semibold text-ink">{customerPulse[0].name}</p>
                    <p className="text-[11px] text-ink-soft">
                      {customerPulse[0].visits} interactions | {formatCurrency(customerPulse[0].value)}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-brand/18 bg-linear-to-br from-panel/96 to-panel-strong/78 p-3 shadow-sm shadow-brand/8">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">Moderation</p>
                  <span className="text-[10px] font-semibold text-ink-soft">{canViewModerationAudit ? "super-admin" : "standard"}</span>
                </div>
                {canViewModerationAudit ? (
                  <>
                    <p className="mt-1 text-xs text-ink-soft">Recent actions: {moderationActivityCount}</p>
                    {loadingModerationAudit ? (
                      <p className="mt-1 text-xs text-ink-soft">Loading audit activity...</p>
                    ) : moderationAuditLogs.length === 0 ? (
                      <p className="mt-1 text-xs text-ink-soft">No audit entries yet.</p>
                    ) : (
                      <div className="mt-2 space-y-1.5">
                        {moderationAuditLogs.slice(0, 3).map((item, index) => (
                          <div key={`${item?.id || item?.createdAt || "audit"}-${index}`} className="rounded-lg border border-line/70 bg-panel/95 px-2 py-1.5">
                            <p className="line-clamp-1 text-[11px] font-semibold text-ink">
                              {String(item?.action || "audit").replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-ink-soft">{item?.createdAt ? formatRelativeTime(item.createdAt) : "just now"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-xs text-ink-soft">Audit feed visible to super-admin only.</p>
                )}
              </div>
            </div>
          </Surface>

          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Customer pulse"
              title="Top returning customers"
              description="Quick visibility into repeat activity and estimated customer value."
            />
            {customerPulse.length === 0 ? (
              <EmptyState title="No customer activity yet" description="Customer insights will appear as bookings and orders come in." />
            ) : (
              <div className="space-y-2">
                {customerPulse.map((customer, index) => (
                  <div key={`${customer.email}-${index}`} className="rounded-xl border border-line/70 bg-panel/92 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{customer.name}</p>
                      <span className="text-xs text-ink-soft">{customer.visits} interactions</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">{customer.email}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      Estimated value: <strong className="text-ink">{formatCurrency(customer.value)}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Section shortcuts"
              title="Open a workflow"
              description="Move from the overview into a focused dashboard section."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <button type="button" className="text-left" onClick={focusPendingBookings}>
                <StatCard label="Bookings" value={dashboard.bookings.length} helper="Open bookings" />
              </button>
              <button type="button" className="text-left" onClick={focusPendingOrders}>
                <StatCard label="Orders" value={dashboard.orders.length} helper="Open orders" />
              </button>
              <button type="button" className="text-left" onClick={focusUnreadMessages}>
                <StatCard
                  label="Messages"
                  value={dashboard.messages.length}
                  helper={unreadMessagesCount > 0 ? `${unreadMessagesCount} unread` : "All messages read"}
                />
              </button>
              <button type="button" className="text-left" onClick={focusProductsManagement}>
                <StatCard label="Products" value={dashboard.products.length} helper="Open products" />
              </button>
              <StatCard label="Due now" value={formatCurrency(dueNowTotal)} />
              <StatCard label="Order value" value={formatCurrency(orderRevenueTotal)} />
            </div>
          </Surface>

          <Surface className="space-y-4 border-white/30 bg-panel/88 shadow-xl">
            <SectionHeading
              eyebrow="Workspace tools"
              title="View modes and exports"
              description="Adjust how list sections render and export the filtered datasets when needed."
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button className="w-full sm:w-auto" type="button" variant={viewMode === "cards" ? "default" : "outline"} onClick={() => setViewMode("cards")}>
                Cards view
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant={viewMode === "compact" ? "default" : "outline"} onClick={() => setViewMode("compact")}>
                Compact view
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={exportBookingsCsv}>
                Export bookings CSV
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={exportOrdersCsv}>
                Export orders CSV
              </Button>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
