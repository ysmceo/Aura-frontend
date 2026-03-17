import {
  CalendarCheck2,
  LayoutDashboard,
  MessageSquareText,
  PackageSearch,
  Settings,
  ShoppingBag
} from "lucide-react";

export const BOOKING_STATUSES = ["pending", "approved", "cancelled", "completed"];

export const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  cancelled: "Cancelled",
  completed: "Completed"
};

export const ORDER_STATUSES = ["pending", "approved", "processed", "shipped", "on_the_way", "delivered", "cancelled"];

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  processed: "Processed",
  shipped: "Shipped",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export const ORDER_STATUS_FLOW_TEXT = "Pending -> Approved -> Processed -> Shipped -> On the way -> Delivered";

export const ADMIN_SECTIONS = [
  {
    key: "overview",
    path: "overview",
    title: "Overview",
    description: "Monitor queue pressure, operations, and customer activity from one dashboard.",
    icon: LayoutDashboard
  },
  {
    key: "bookings",
    path: "bookings",
    title: "Bookings",
    description: "Review appointments, approvals, replies, and daily assignment flow.",
    icon: CalendarCheck2
  },
  {
    key: "orders",
    path: "orders",
    title: "Orders",
    description: "Handle product fulfillment, delivery updates, and customer follow-ups.",
    icon: ShoppingBag
  },
  {
    key: "messages",
    path: "messages",
    title: "Messages",
    description: "Triaging inbox activity, complaints, and customer replies.",
    icon: MessageSquareText
  },
  {
    key: "products",
    path: "products",
    title: "Products",
    description: "Manage catalog items, images, stock, and pricing.",
    icon: PackageSearch
  },
  {
    key: "settings",
    path: "settings",
    title: "Settings",
    description: "Adjust delivery fees and workspace preferences.",
    icon: Settings
  }
];

export function getAdminSection(sectionKey) {
  return ADMIN_SECTIONS.find((item) => item.key === sectionKey) || ADMIN_SECTIONS[0];
}
