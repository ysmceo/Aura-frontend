import { Button } from "@/components/ui/button";
import {
  DetailRow,
  EmptyState,
  SectionHeading,
  StatusPill,
  Surface
} from "@/components/site/shared";
import { formatCurrency } from "@/lib/site";
import { ORDER_STATUSES } from "@/components/admin/admin-config";
import { useAdminDashboard } from "@/components/admin/AdminDashboardContext";

export default function OrdersSection() {
  const {
    dashboard,
    orderSearch,
    setOrderSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    orderDateFilter,
    setOrderDateFilter,
    bulkOrderStatus,
    setBulkOrderStatus,
    applyBulkOrderStatus,
    loadingDashboard,
    selectedOrderCount,
    orderSlice,
    selectedOrderIds,
    setSelectedOrderIds,
    toggleSelection,
    viewMode,
    renderOrderContactActions,
    renderOrderReplyComposer,
    saveOrder,
    ordersPage,
    setOrdersPage,
    orderPages,
    getOrderStatusLabel
  } = useAdminDashboard();

  return (
    <div className="space-y-5 sm:space-y-6">
      <Surface className="space-y-5 border-white/30 bg-panel/88 shadow-xl">
        <SectionHeading
          eyebrow="Orders"
          title="Order fulfillment"
          description="Filter product orders, update fulfillment state, and keep customer communication attached to each record."
        />

        <div className="grid gap-3 lg:grid-cols-3">
          <input
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            placeholder="Search by order code, customer, speed"
            value={orderSearch}
            onChange={(event) => setOrderSearch(event.target.value)}
          />
          <select
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={orderStatusFilter}
            onChange={(event) => setOrderStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getOrderStatusLabel(status)}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="h-11 rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink"
            value={orderDateFilter}
            onChange={(event) => setOrderDateFilter(event.target.value)}
          />
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            className="w-full sm:w-auto"
            type="button"
            variant="outline"
            onClick={() => {
              const pageIds = orderSlice.map((item) => item.id);
              const hasUnselected = pageIds.some((id) => !selectedOrderIds.includes(id));
              setSelectedOrderIds((prev) =>
                hasUnselected ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id))
              );
            }}
          >
            {orderSlice.some((item) => !selectedOrderIds.includes(item.id)) ? "Select page" : "Unselect page"}
          </Button>
          <select
            className="h-11 w-full rounded-[1.2rem] border border-line bg-panel/92 px-4 text-sm text-ink sm:w-auto"
            value={bulkOrderStatus}
            onChange={(event) => setBulkOrderStatus(event.target.value)}
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getOrderStatusLabel(status)}
              </option>
            ))}
          </select>
          <Button className="w-full sm:w-auto" type="button" onClick={applyBulkOrderStatus} disabled={loadingDashboard || !selectedOrderCount}>
            Apply to {selectedOrderCount || 0} order(s)
          </Button>
        </div>

        {orderSlice.length === 0 ? <EmptyState title="No orders yet" description="Product orders will appear here once customers place them." /> : null}

        {viewMode === "cards" ? (
          <div className="space-y-3">
            {orderSlice.map((item) => (
              <div key={item.id} className="rounded-[1.4rem] border border-line/70 bg-panel/92 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex min-w-0 items-center gap-3">
                    <input type="checkbox" checked={selectedOrderIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedOrderIds)} />
                    <p className="min-w-0 break-words font-semibold text-ink">{item.orderCode}</p>
                  </label>
                  <StatusPill value={item.status} />
                </div>
                <div className="mt-3 space-y-2">
                  <DetailRow label="Customer" value={item.name} />
                  <DetailRow label="Email" value={item.email || "N/A"} />
                  <DetailRow label="Phone" value={item.phone || "N/A"} />
                  <DetailRow label="Delivery speed" value={item.deliverySpeed} />
                  <DetailRow label="Total" value={formatCurrency(item.totalAmount)} />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    className="h-11 flex-1 rounded-[1.4rem] border border-line bg-panel/92 px-4 text-ink"
                    value={item.status}
                    onChange={(event) => saveOrder(item.id, event.target.value, { source: "orders-panel" })}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
                {renderOrderContactActions(item)}
                {renderOrderReplyComposer(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {orderSlice.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-[1.1rem] border border-line/70 bg-panel/92 p-3 lg:grid-cols-[auto,minmax(0,1fr),auto,auto] lg:items-center">
                <input type="checkbox" checked={selectedOrderIds.includes(item.id)} onChange={() => toggleSelection(item.id, setSelectedOrderIds)} />
                <div className="min-w-0">
                  <p className="break-words font-semibold text-ink">{item.orderCode} | {item.name}</p>
                  <p className="break-words text-sm text-ink-soft">{item.deliverySpeed} | {formatCurrency(item.totalAmount)}</p>
                  <p className="break-words text-xs text-ink-soft">{item.email || "N/A"} | {item.phone || "N/A"}</p>
                </div>
                <StatusPill value={item.status} />
                <select
                  className="h-10 w-full rounded-[0.9rem] border border-line bg-panel/92 px-3 text-sm text-ink lg:w-auto"
                  value={item.status}
                  onChange={(event) => saveOrder(item.id, event.target.value, { source: "orders-panel" })}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </option>
                    ))}
                </select>
                <div className="lg:col-span-4">
                  {renderOrderContactActions(item)}
                  {renderOrderReplyComposer(item)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-stretch gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={ordersPage === 1} onClick={() => setOrdersPage(ordersPage - 1)}>
            Previous
          </Button>
          <span className="text-sm text-ink-soft">
            Page {ordersPage} of {orderPages}
          </span>
          <Button className="w-full sm:w-auto" type="button" variant="outline" disabled={ordersPage >= orderPages} onClick={() => setOrdersPage(ordersPage + 1)}>
            Next
          </Button>
        </div>

        <div className="rounded-[1.2rem] border border-line/70 bg-panel/88 px-4 py-3 text-sm text-ink-soft">
          Total orders loaded: <strong className="text-ink">{dashboard.orders.length}</strong>
        </div>
      </Surface>
    </div>
  );
}
