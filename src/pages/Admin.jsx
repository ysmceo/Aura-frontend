import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { AdminDashboardProvider } from "@/components/admin/AdminDashboardContext";
import {
  ADMIN_SECTIONS,
  ORDER_STATUS_LABELS,
  getAdminSection
} from "@/components/admin/admin-config";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost, apiPut, apiRequest } from "@/lib/api";
import {
  DetailRow,
  EmptyState,
  Notice,
  SectionHeading,
  StatusPill,
  Surface,
  TextField
} from "@/components/site/shared";
import { formatCurrency, getErrorMessage } from "@/lib/site";

const TOKEN_KEY = "ceo-salon-admin-token";
const BOOKING_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  cancelled: "Cancelled",
  completed: "Completed"
};
const ADMIN_BACKGROUND_VIDEO_URL = "https://cdn.dribbble.com/userupload/44652968/file/313877bf29b8434b808c8aaad3f89a21.mp4";
const ADMIN_BACKGROUND_FALLBACK_IMAGE_URL = "/images/p1.webp";
const ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL = "https://cdn.dribbble.com/userupload/46843023/file/c8ecfc7f661d1ee36316579ecc740df8.png?resize=1504x859&vertical=center";
const ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_2 = "https://cdn.dribbble.com/userupload/28418169/file/original-f7ba68fe4b600723f4f39a77f5594366.jpg?resize=1504x1128&vertical=center";
const ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_3 = "https://cdn.dribbble.com/userupload/46796275/file/0401c6eae53a08c15288d734455c8986.jpg?resize=752x752&vertical=center";
const ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_4 = "https://cdn.dribbble.com/userupload/45372165/file/97172825d6f3508c7a3d9b6d5116799e.jpg?resize=1504x1504&vertical=center";
const ADMIN_BACKGROUND_SWAP_MS = 6200;
const ADMIN_OPS_SETTINGS_KEY = "ceo-admin-ops-settings";
const ADMIN_OPS_ASSIGNMENTS_KEY = "ceo-admin-ops-assignments";
const DEFAULT_STAFF_INPUT = "Amina, Tunde, Grace";
const WEATHER_CODE_LABELS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Heavy thunderstorm with hail"
};
function toDateKey(value) {
  const parsed = new Date(String(value || ""));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatRelativeTime(value) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return "just now";

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const isFuture = diffMs > 0;
  const absMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < minute) {
    return "just now";
  }

  if (absMs < hour) {
    const minutes = Math.round(absMs / minute);
    return isFuture ? `in ${minutes} min${minutes === 1 ? "" : "s"}` : `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  if (absMs < day) {
    const hours = Math.round(absMs / hour);
    return isFuture ? `in ${hours} hour${hours === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(absMs / day);
  return isFuture ? `in ${days} day${days === 1 ? "" : "s"}` : `${days} day${days === 1 ? "" : "s"} ago`;
}

function normalizeMessageReportType(value) {
  return String(value || "general_message").trim().toLowerCase();
}

function isComplaintReportType(value) {
  const normalized = normalizeMessageReportType(value);
  return normalized.includes("complaint") || normalized.includes("issue") || normalized.includes("report");
}

function readJsonFromStorage(key, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallbackValue;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallbackValue : parsed;
  } catch {
    return fallbackValue;
  }
}

function resolveWeatherLabel(code) {
  if (!Number.isFinite(Number(code))) {
    return "Weather unavailable";
  }

  return WEATHER_CODE_LABELS[Number(code)] || "Weather update";
}

function normalizeWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function normalizeLegacyBookingStatus(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "accepted") return "approved";
  if (normalized === "declined") return "cancelled";
  return normalized || "pending";
}

function downloadCsv(filename, rows) {
  if (!rows.length || typeof window === "undefined") return;
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const lines = rows.map((row) => keys.map((key) => escapeCsv(row[key])).join(","));
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadDashboard(token) {
  const options = { token };
  const [bookingsResponse, orders, messages, products, deliveryFees] = await Promise.all([
    apiRequest("/api/admin/bookings", options),
    apiRequest("/api/admin/product-orders", options),
    apiRequest("/api/admin/messages", options),
    apiRequest("/api/admin/products", options),
    apiRequest("/api/admin/product-orders/delivery-fees", options)
  ]);

  const bookings = Array.isArray(bookingsResponse)
    ? bookingsResponse.map((item) => ({
      ...item,
      status: normalizeLegacyBookingStatus(item?.status)
    }))
    : [];

  return {
    bookings,
    orders: Array.isArray(orders) ? orders : [],
    messages: Array.isArray(messages) ? messages : [],
    products: Array.isArray(products) ? products : [],
    fees: deliveryFees && deliveryFees.fees ? deliveryFees.fees : { standard: 0, express: 0 }
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
// Pagination state
    const [bookingsPage, setBookingsPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
  const [newRequestsPage, setNewRequestsPage] = useState(1);
  const [newRequestsPageSize, setNewRequestsPageSize] = useState(8);
    const BOOKINGS_PER_PAGE = 5;
    const ORDERS_PER_PAGE = 5;
  const [token, setToken] = useState(() => (typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) || "" : ""));
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [authNotice, setAuthNotice] = useState(null);
  const [dashboardNotice, setDashboardNotice] = useState(null);
  const [moderationNotice, setModerationNotice] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [savingFees, setSavingFees] = useState(false);
  const [adminIdentity, setAdminIdentity] = useState(null);
  const [moderationAuditLogs, setModerationAuditLogs] = useState([]);
  const [loadingModerationAudit, setLoadingModerationAudit] = useState(false);
  const [dashboard, setDashboard] = useState({ bookings: [], orders: [], messages: [], products: [], fees: { standard: 0, express: 0 } });
  const [login, setLogin] = useState({ email: "", password: "", oneTimeCode: "", secretPasscode: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showLoginPasscode, setShowLoginPasscode] = useState(false);
  const [requestingLoginOtp, setRequestingLoginOtp] = useState(false);
  const [register, setRegister] = useState({ name: "", email: "", password: "", secretPasscode: "" });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterPasscode, setShowRegisterPasscode] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", category: "", price: "", stock: "", image: null });
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [feeForm, setFeeForm] = useState({ standard: 0, express: 0 });
  const [viewMode, setViewMode] = useState("cards");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingDateFilter, setBookingDateFilter] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderDateFilter, setOrderDateFilter] = useState("");
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bookingActionBusyById, setBookingActionBusyById] = useState({});
  const [orderActionBusyById, setOrderActionBusyById] = useState({});
  const [focusedBookingId, setFocusedBookingId] = useState("");
  const [bulkBookingStatus, setBulkBookingStatus] = useState("approved");
  const [bulkOrderStatus, setBulkOrderStatus] = useState("processed");
  const [activeBookingReplyId, setActiveBookingReplyId] = useState(null);
  const [activeBookingHistoryId, setActiveBookingHistoryId] = useState(null);
  const [bookingReplyDrafts, setBookingReplyDrafts] = useState({});
  const [bookingHistorySearch, setBookingHistorySearch] = useState({});
  const [activeOrderReplyId, setActiveOrderReplyId] = useState(null);
  const [orderReplyDrafts, setOrderReplyDrafts] = useState({});
  const [backgroundVideoFailed, setBackgroundVideoFailed] = useState(false);
  const [activeBackgroundLayer, setActiveBackgroundLayer] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [adminNow, setAdminNow] = useState(() => new Date());
  const [adminWeather, setAdminWeather] = useState({
    loading: true,
    temperature: null,
    weatherCode: null,
    label: "Weather unavailable"
  });
  const [messageStatusFilter, setMessageStatusFilter] = useState("all");
  const [messageTypeFilter, setMessageTypeFilter] = useState("all");
  const [messageSearch, setMessageSearch] = useState("");
  const [activeMessageReplyId, setActiveMessageReplyId] = useState(null);
  const [messageReplyDrafts, setMessageReplyDrafts] = useState({});
  const [operationsDate, setOperationsDate] = useState(() => todayDateKey());
  const [operationsChairCapacity, setOperationsChairCapacity] = useState(() => {
    const saved = readJsonFromStorage(ADMIN_OPS_SETTINGS_KEY, null);
    const capacity = Number(saved && saved.chairCapacity);
    return Number.isFinite(capacity) && capacity > 0 ? capacity : 4;
  });
  const [operationsStaffInput, setOperationsStaffInput] = useState(() => {
    const saved = readJsonFromStorage(ADMIN_OPS_SETTINGS_KEY, null);
    const staffInput = String(saved && saved.staffInput ? saved.staffInput : "").trim();
    return staffInput || DEFAULT_STAFF_INPUT;
  });
  const [bookingAssignments, setBookingAssignments] = useState(() => {
    const saved = readJsonFromStorage(ADMIN_OPS_ASSIGNMENTS_KEY, {});
    return saved && typeof saved === "object" ? saved : {};
  });
  const [assignmentNotifyBusyByBookingId, setAssignmentNotifyBusyByBookingId] = useState({});
  const [recentlyApprovedBookingIds, setRecentlyApprovedBookingIds] = useState({});
  const approvalFlashTimersRef = useRef({});

  useEffect(() => {
    apiGet("/api/admin/registration-status")
      .then((data) => setRegistrationOpen(Boolean(data.registrationOpen)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!token) return;

    loadDashboard(token)
      .then((data) => {
        setDashboard(data);
        setFeeForm({ standard: data.fees.standard || 0, express: data.fees.express || 0 });
        setLastRefreshedAt(new Date().toISOString());
      })
      .catch((error) => {
        setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
        setToken("");
        if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
      });
  }, [token]);

  useEffect(() => {
    let active = true;

    async function loadAdminModerationContext() {
      if (!token) {
        if (!active) return;
        setAdminIdentity(null);
        setModerationAuditLogs([]);
        setLoadingModerationAudit(false);
        setModerationNotice(null);
        return;
      }

      try {
        const verifyResponse = await apiPost("/api/admin/verify", { token }, { token });
        if (!active) return;

        const nextAdmin = verifyResponse && verifyResponse.admin ? verifyResponse.admin : null;
        setAdminIdentity(nextAdmin);

        const normalizedRole = String(nextAdmin?.role || "").trim().toLowerCase();
        const canViewAudit = normalizedRole === "super-admin";

        if (!canViewAudit) {
          setModerationAuditLogs([]);
          setLoadingModerationAudit(false);
          setModerationNotice(null);
          return;
        }

        setLoadingModerationAudit(true);
        const auditResponse = await apiGet("/api/admin/audit-logs?limit=40", { token });
        if (!active) return;

        setModerationAuditLogs(Array.isArray(auditResponse?.logs) ? auditResponse.logs : []);
        setModerationNotice(null);
      } catch (error) {
        if (!active) return;
        setModerationAuditLogs([]);
        setModerationNotice({ tone: "error", message: getErrorMessage(error) });
      } finally {
        if (active) {
          setLoadingModerationAudit(false);
        }
      }
    }

    loadAdminModerationContext();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !autoRefreshEnabled) return;

    const intervalId = setInterval(async () => {
      try {
        const data = await loadDashboard(token);
        setDashboard(data);
        setFeeForm({ standard: data.fees.standard || 0, express: data.fees.express || 0 });
        setLastRefreshedAt(new Date().toISOString());
      } catch {
        // Keep silent for background refresh so admin can continue current task.
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [token, autoRefreshEnabled]);

  useEffect(() => {
    setBookingsPage(1);
    setSelectedBookingIds([]);
  }, [bookingSearch, bookingStatusFilter, bookingDateFilter]);

  useEffect(() => {
    setOrdersPage(1);
    setSelectedOrderIds([]);
  }, [orderSearch, orderStatusFilter, orderDateFilter]);

  useEffect(() => {
    setNewRequestsPage(1);
  }, [dashboard.bookings.length, dashboard.orders.length]);

  useEffect(() => {
    setNewRequestsPage(1);
  }, [newRequestsPageSize]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_OPS_SETTINGS_KEY, JSON.stringify({
      chairCapacity: operationsChairCapacity,
      staffInput: operationsStaffInput
    }));
  }, [operationsChairCapacity, operationsStaffInput]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_OPS_ASSIGNMENTS_KEY, JSON.stringify(bookingAssignments));
  }, [bookingAssignments]);

  useEffect(() => {
    return () => {
      const timers = approvalFlashTimersRef.current || {};
      Object.values(timers).forEach((timerId) => clearTimeout(timerId));
      approvalFlashTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveBackgroundLayer((prev) => {
        if (backgroundVideoFailed) {
          // When video is unavailable, rotate between image layers only.
          return prev === 1 ? 2 : prev === 2 ? 3 : prev === 3 ? 4 : 1;
        }
        return (prev + 1) % 5;
      });
    }, ADMIN_BACKGROUND_SWAP_MS);

    return () => clearInterval(intervalId);
  }, [backgroundVideoFailed]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setAdminNow(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const data = await apiGet("/api/weather");
        if (!active) return;

        const current = data && typeof data === "object" ? data.current : null;
        const nextCode = Number(current && current.weather_code);
        const nextTemp = Number(current && current.temperature_2m);

        setAdminWeather({
          loading: false,
          temperature: Number.isFinite(nextTemp) ? nextTemp : null,
          weatherCode: Number.isFinite(nextCode) ? nextCode : null,
          label: resolveWeatherLabel(nextCode)
        });
      } catch {
        if (!active) return;
        setAdminWeather((prev) => ({
          ...prev,
          loading: false,
          label: "Weather unavailable"
        }));
      }
    }

    loadWeather();
    const refreshTimerId = setInterval(loadWeather, 10 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(refreshTimerId);
    };
  }, []);

  async function refreshDashboard() {
    if (!token) return;

    try {
      setLoadingDashboard(true);
      const data = await loadDashboard(token);
      setDashboard(data);
      setFeeForm({ standard: data.fees.standard || 0, express: data.fees.express || 0 });
      setLastRefreshedAt(new Date().toISOString());
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
      setToken("");
      if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (!String(login.oneTimeCode || "").trim()) {
      setAuthNotice({ tone: "error", message: "Enter the one-time code sent to your admin email before logging in." });
      return;
    }

    try {
      const data = await apiPost("/api/admin/login", login);
      setToken(data.token || "");
      setAuthNotice({ tone: "success", message: data.message || "Login successful." });
      if (typeof window !== "undefined" && data.token) window.localStorage.setItem(TOKEN_KEY, data.token);
    } catch (error) {
      const message = getErrorMessage(error);
      const isNetworkFetchError = /failed to fetch|network|unable to connect/i.test(String(message));
      setAuthNotice({
        tone: "error",
        message: isNetworkFetchError
          ? "Login failed because the backend API is not reachable. Start backend server (common local ports: 3000/3001/3002/3100) and try again."
          : message
      });
    }
  }

  async function handleRequestLoginOtp() {
    const email = String(login.email || "").trim();
    const secretPasscode = String(login.secretPasscode || "").trim();

    if (!email || !secretPasscode) {
      setAuthNotice({ tone: "error", message: "Enter admin email and secret code before requesting one-time code." });
      return;
    }

    try {
      setRequestingLoginOtp(true);
      const data = await apiPost("/api/admin/request-login-access", { email, secretPasscode });
      const fallbackCode = String(data?.accessCode || "").trim();
      const deliveredChannels = Array.isArray(data?.deliveredBy) ? data.deliveredBy : [];
      const deliveryEmailTarget = String(data?.deliveryTargets?.email || "").trim();
      const usingEmailOverride = Boolean(data?.deliveryTargets?.usingEmailOverride);
      const emailReason = String(data?.delivery?.email?.reason || "").trim();
      const smsReason = String(data?.delivery?.sms?.reason || "").trim();

      if (fallbackCode) {
        setLogin((prev) => ({ ...prev, oneTimeCode: fallbackCode }));
      }

      const fallbackMessage = fallbackCode
        ? `Fallback OTP: ${fallbackCode}. It has been auto-filled in the OTP field.`
        : "";
      const inboxMessage = fallbackCode
        ? ""
        : usingEmailOverride && deliveryEmailTarget
          ? `OTP email is currently routed to ${deliveryEmailTarget} because ADMIN_LOGIN_OTP_EMAIL_OVERRIDE is set. Check that inbox (and spam) and continue login.`
          : `Check ${(deliveryEmailTarget || email)} inbox (and spam) and continue login.`;
      const channelSummary = deliveredChannels.length
        ? `Delivery channel: ${deliveredChannels.join(" & ")}.`
        : "Delivery channel: response.";
      const diagnostics = [
        emailReason ? `Email: ${emailReason}` : "",
        smsReason ? `SMS: ${smsReason}` : ""
      ]
        .filter(Boolean)
        .join(" | ");

      setAuthNotice({
        tone: fallbackCode ? "info" : "success",
        message: [
          data.message || "One-time code sent.",
          fallbackCode ? fallbackMessage : inboxMessage,
          channelSummary,
          diagnostics
        ]
          .filter(Boolean)
          .join(" ")
      });
    } catch (error) {
      setAuthNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setRequestingLoginOtp(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    try {
      const data = await apiPost("/api/admin/register", register);
      setAuthNotice({ tone: "success", message: data.message || "Admin registered." });
      setLogin({ email: register.email, password: register.password, oneTimeCode: "", secretPasscode: register.secretPasscode });
    } catch (error) {
      setAuthNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  async function handleAddProduct(event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("category", productForm.category);
      formData.append("price", productForm.price);
      formData.append("stock", productForm.stock);
      if (productForm.image) formData.append("productImage", productForm.image);

      await apiRequest("/api/admin/products", {
        method: "POST",
        token,
        body: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });
      setDashboardNotice({ tone: "success", message: "Product added." });
      setProductForm({ name: "", category: "", price: "", stock: "", image: null });
      setProductImagePreview(null);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  async function saveBooking(id, status, options = {}) {
    const bookingId = String(id || "").trim();
    if (!bookingId) return;

    const source = String(options?.source || "bookings-panel").trim().toLowerCase();
    const sourceLabel = source === "approval-queue" ? "Booking approval queue" : "Bookings panel";

    try {
      setBookingActionBusyById((prev) => ({ ...prev, [bookingId]: true }));

      const response = await apiPut(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, { status }, { token });
      const previousStatus = normalizeStatus(response?.previousStatus || "");
      const currentStatus = normalizeStatus(response?.currentStatus || status);
      syncBookingStatusLocally(bookingId, currentStatus);
      const previousLabel = BOOKING_STATUS_LABELS[previousStatus] || String(previousStatus || "").trim();
      const currentLabel = BOOKING_STATUS_LABELS[currentStatus] || String(status || "Pending");
      const transitionText = previousLabel ? `${previousLabel} → ${currentLabel}` : currentLabel;
      const customerEmailNotice = response?.notifications?.email;
      let emailStatusSuffix = "";
      if (customerEmailNotice?.sent) {
        emailStatusSuffix = " Customer approval email sent.";
      } else if (customerEmailNotice?.error) {
        emailStatusSuffix = ` Customer email failed: ${String(customerEmailNotice.reason || "send error")}.`;
      } else if (customerEmailNotice?.reason && !String(customerEmailNotice.reason).toLowerCase().includes("no status change")) {
        emailStatusSuffix = ` Customer email status: ${String(customerEmailNotice.reason)}.`;
      }

      setDashboardNotice({
        tone: "success",
        message: `${sourceLabel}: Booking moved to ${transitionText}.${emailStatusSuffix}`
      });
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setBookingActionBusyById((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    }
  }

  async function saveOrder(id, status, options = {}) {
    const orderId = String(id || "").trim();
    if (!orderId) return;

    const source = String(options?.source || "queue").trim().toLowerCase();
    const sourceLabel = source === "queue" ? "Incoming queue" : "Orders panel";

    try {
      setOrderActionBusyById((prev) => ({ ...prev, [orderId]: true }));

      const response = await apiPut(`/api/admin/product-orders/${encodeURIComponent(orderId)}`, { status }, { token });
      const normalizedNextStatus = normalizeStatus(response?.currentStatus || status);
      const normalizedPreviousStatus = normalizeStatus(response?.previousStatus || "");
      syncOrderStatusLocally(orderId, normalizedNextStatus);
      const nextStatusLabel = getOrderStatusLabel(normalizedNextStatus || status);
      const previousStatusLabel = normalizedPreviousStatus ? getOrderStatusLabel(normalizedPreviousStatus) : "";
      const customerEmailNotice = response?.notifications?.customerEmail;
      const shouldIncludeEmailNotice = ["approved", "processed", "shipped", "on_the_way", "delivered", "cancelled"].includes(normalizedNextStatus);

      let emailStatusSuffix = "";
      if (shouldIncludeEmailNotice) {
        if (customerEmailNotice?.sent) {
          emailStatusSuffix = " Customer notification email sent.";
        } else if (customerEmailNotice?.error) {
          emailStatusSuffix = ` Customer email failed: ${String(customerEmailNotice.reason || "send error")}.`;
        } else if (customerEmailNotice?.reason && !String(customerEmailNotice.reason).toLowerCase().includes("no status change")) {
          emailStatusSuffix = ` Customer email status: ${String(customerEmailNotice.reason)}.`;
        }
      }

      const transitionText = previousStatusLabel && nextStatusLabel
        ? `${previousStatusLabel} → ${nextStatusLabel}`
        : nextStatusLabel;

      setDashboardNotice({
        tone: "success",
        message: `${sourceLabel}: Order moved to ${transitionText}.${emailStatusSuffix}`
      });
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setOrderActionBusyById((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  }

  async function saveFees(event) {
    event.preventDefault();

    const standard = Number(String(feeForm.standard ?? "").replace(/,/g, "").trim());
    const express = Number(String(feeForm.express ?? "").replace(/,/g, "").trim());

    if (!Number.isFinite(standard) || !Number.isFinite(express)) {
      setDashboardNotice({ tone: "error", message: "Enter valid numbers for standard and express fees." });
      return;
    }

    if (standard < 0 || express < 0) {
      setDashboardNotice({ tone: "error", message: "Delivery fees cannot be negative." });
      return;
    }

    try {
      setSavingFees(true);
      const response = await apiPut(
        "/api/admin/product-orders/delivery-fees",
        { standard, express },
        { token }
      );

      const updatedFees = response && response.fees
        ? {
          standard: Number(response.fees.standard) || 0,
          express: Number(response.fees.express) || 0
        }
        : { standard, express };

      setFeeForm(updatedFees);
      setDashboard((prev) => ({
        ...prev,
        fees: updatedFees
      }));
      setDashboardNotice({
        tone: "success",
        message: `Delivery fees saved. Standard: ₦${updatedFees.standard.toLocaleString()} · Express: ₦${updatedFees.express.toLocaleString()}`
      });
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setSavingFees(false);
    }
  }

  async function copyContactValue(value, label) {
    const text = String(value || "").trim();
    if (!text) {
      setDashboardNotice({ tone: "error", message: `No ${label.toLowerCase()} available to copy.` });
      return;
    }

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setDashboardNotice({ tone: "error", message: "Clipboard access is not available in this browser." });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setDashboardNotice({ tone: "success", message: `${label} copied.` });
    } catch {
      setDashboardNotice({ tone: "error", message: `Could not copy ${label.toLowerCase()}.` });
    }
  }

  function normalizeStatus(value) {
    return String(value || "").trim().toLowerCase();
  }

  function syncBookingStatusLocally(bookingId, nextStatus) {
    const normalizedId = String(bookingId || "").trim();
    if (!normalizedId) return;
    const normalizedNext = normalizeStatus(nextStatus) || "pending";
    const nowIso = new Date().toISOString();

    setDashboard((prev) => ({
      ...prev,
      bookings: Array.isArray(prev.bookings)
        ? prev.bookings.map((booking) => {
          if (String(booking?.id || "") !== normalizedId) return booking;
          return {
            ...booking,
            status: normalizedNext,
            updatedAt: nowIso
          };
        })
        : prev.bookings
    }));
  }

  function syncOrderStatusLocally(orderId, nextStatus) {
    const normalizedId = String(orderId || "").trim();
    if (!normalizedId) return;
    const normalizedNext = normalizeStatus(nextStatus) || "pending";
    const nowIso = new Date().toISOString();

    setDashboard((prev) => ({
      ...prev,
      orders: Array.isArray(prev.orders)
        ? prev.orders.map((order) => {
          if (String(order?.id || "") !== normalizedId) return order;
          return {
            ...order,
            status: normalizedNext,
            updatedAt: nowIso
          };
        })
        : prev.orders
    }));
  }

  function getOrderStatusLabel(value) {
    const normalized = normalizeStatus(value);
    return ORDER_STATUS_LABELS[normalized] || String(value || "Pending");
  }

  function getItemDate(item) {
    return String(item?.date || item?.createdAt || "");
  }

  function toggleSelection(id, setter) {
    setter((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  async function applyBulkBookingStatus() {
    if (!selectedBookingIds.length) {
      setDashboardNotice({ tone: "error", message: "Select at least one booking first." });
      return;
    }

    try {
      setLoadingDashboard(true);
      await Promise.all(
        selectedBookingIds.map((id) => apiPut(`/api/admin/bookings/${encodeURIComponent(id)}`, { status: bulkBookingStatus }, { token }))
      );
      setDashboardNotice({ tone: "success", message: `Updated ${selectedBookingIds.length} booking(s).` });
      setSelectedBookingIds([]);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setLoadingDashboard(false);
    }
  }

  async function applyBulkOrderStatus() {
    if (!selectedOrderIds.length) {
      setDashboardNotice({ tone: "error", message: "Select at least one order first." });
      return;
    }

    try {
      setLoadingDashboard(true);
      await Promise.all(
        selectedOrderIds.map((id) => apiPut(`/api/admin/product-orders/${encodeURIComponent(id)}`, { status: bulkOrderStatus }, { token }))
      );
      setDashboardNotice({ tone: "success", message: `Updated ${selectedOrderIds.length} order(s).` });
      setSelectedOrderIds([]);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setLoadingDashboard(false);
    }
  }

  function getBookingReplyDefaults(booking) {
    const customerName = String(booking?.name || "Customer");
    return {
        subject: `Booking follow-up from Aura Salon`,
        message: `Hello ${customerName},\n\nThank you for your booking. This is an update regarding your appointment.\n\nBest regards,\nAura Salon`
    };
  }

  function getBookingRescheduleTemplate(booking) {
    const customerName = String(booking?.name || "Customer");
    const bookingId = String(booking?.id || "").trim();
    const serviceName = String(booking?.serviceName || "your appointment").trim();
    const when = `${String(booking?.date || "").trim()} ${String(booking?.time || "").trim()}`.trim() || "your scheduled time";
    return {
      subject: `Reschedule request${bookingId ? ` (${bookingId})` : ""}`,
        message: `Hello ${customerName},\n\nWe need to reschedule ${serviceName} that was planned for ${when}.\n\nPlease reply with your preferred new date and time so we can confirm your next appointment.\n\nBest regards,\nAura Salon`
    };
  }

  function getBookingReminderTemplate(booking) {
    const customerName = String(booking?.name || "Customer");
    const serviceName = String(booking?.serviceName || "appointment").trim();
    const when = `${String(booking?.date || "").trim()} ${String(booking?.time || "").trim()}`.trim() || "your scheduled time";
    return {
      subject: `Appointment reminder - ${when}`,
        message: `Hello ${customerName},\n\nThis is a friendly reminder for your ${serviceName} appointment scheduled for ${when}.\n\nIf you need to adjust your schedule, kindly reply to this email as soon as possible.\n\nWe look forward to seeing you.\n\nBest regards,\nAura Salon`
    };
  }

  function toggleBookingReply(booking) {
    const bookingId = String(booking?.id || "");
    if (!bookingId) return;

    setBookingReplyDrafts((prev) => {
      if (prev[bookingId]) return prev;
      return { ...prev, [bookingId]: getBookingReplyDefaults(booking) };
    });

    setActiveBookingReplyId((prev) => (prev === bookingId ? null : bookingId));
  }

  function updateBookingReplyDraft(bookingId, field, value) {
    setBookingReplyDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || {}),
        [field]: value
      }
    }));
  }

  function applyBookingTemplate(booking, templateType) {
    const bookingId = String(booking?.id || "");
    if (!bookingId) return;

    const nextDraft = templateType === "reschedule"
      ? getBookingRescheduleTemplate(booking)
      : templateType === "reminder"
        ? getBookingReminderTemplate(booking)
        : getBookingReplyDefaults(booking);

    setBookingReplyDrafts((prev) => ({
      ...prev,
      [bookingId]: nextDraft
    }));
    setActiveBookingReplyId(bookingId);
  }

  function toggleBookingHistory(bookingId) {
    setActiveBookingHistoryId((prev) => (prev === bookingId ? null : bookingId));
  }

  function updateBookingHistorySearch(bookingId, value) {
    setBookingHistorySearch((prev) => ({
      ...prev,
      [bookingId]: value
    }));
  }

  async function sendBookingReply(booking) {
    const bookingId = String(booking?.id || "");
    if (!bookingId) return;

    const draft = bookingReplyDrafts[bookingId] || getBookingReplyDefaults(booking);
    const subject = String(draft.subject || "").trim();
    const message = String(draft.message || "").trim();

    if (!subject || !message) {
      setDashboardNotice({ tone: "error", message: "Reply subject and message are required." });
      return;
    }

    try {
      const response = await apiPost(`/api/admin/bookings/${encodeURIComponent(bookingId)}/reply`, { subject, message }, { token });
      const delivery = response?.delivery;
      const deliverySuffix = delivery?.sent
        ? ""
        : ` Reply saved in admin history${delivery?.reason ? ` (${String(delivery.reason)})` : ""}.`;
      setDashboardNotice({ tone: "success", message: `Reply processed for ${booking.email || booking.name || "customer"}.${deliverySuffix}` });
      setActiveBookingReplyId(null);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  function getOrderReplyDefaults(order) {
    const customerName = String(order?.name || "Customer");
    const orderCode = String(order?.orderCode || order?.id || "").trim();
    return {
        subject: `Order update from Aura Salon${orderCode ? ` (${orderCode})` : ""}`,
        message: `Hello ${customerName},\n\nThank you for your order. This is an update regarding your order status and fulfilment.\n\nBest regards,\nAura Salon`
    };
  }

  function getOrderDeliveryTemplate(order) {
    const customerName = String(order?.name || "Customer");
    const orderCode = String(order?.orderCode || order?.id || "").trim();
    const total = Number(order?.totalAmount || 0);
    return {
      subject: `Delivery update${orderCode ? ` (${orderCode})` : ""}`,
        message: `Hello ${customerName},\n\nYour order${orderCode ? ` (${orderCode})` : ""} is currently in delivery processing.\n\nOrder total: ${formatCurrency(total)}\n\nWe will notify you again as soon as it is out for delivery or delivered.\n\nBest regards,\nAura Salon`
    };
  }

  function toggleOrderReply(order) {
    const orderId = String(order?.id || "");
    if (!orderId) return;

    setOrderReplyDrafts((prev) => {
      if (prev[orderId]) return prev;
      return { ...prev, [orderId]: getOrderReplyDefaults(order) };
    });

    setActiveOrderReplyId((prev) => (prev === orderId ? null : orderId));
  }

  function updateOrderReplyDraft(orderId, field, value) {
    setOrderReplyDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        [field]: value
      }
    }));
  }

  function applyOrderTemplate(order, templateType) {
    const orderId = String(order?.id || "");
    if (!orderId) return;

    const nextDraft = templateType === "delivery"
      ? getOrderDeliveryTemplate(order)
      : getOrderReplyDefaults(order);

    setOrderReplyDrafts((prev) => ({
      ...prev,
      [orderId]: nextDraft
    }));
    setActiveOrderReplyId(orderId);
  }

  async function sendOrderReply(order) {
    const orderId = String(order?.id || "");
    if (!orderId) return;

    const draft = orderReplyDrafts[orderId] || getOrderReplyDefaults(order);
    const subject = String(draft.subject || "").trim();
    const message = String(draft.message || "").trim();

    if (!subject || !message) {
      setDashboardNotice({ tone: "error", message: "Reply subject and message are required." });
      return;
    }

    try {
      const response = await apiPost(`/api/admin/product-orders/${encodeURIComponent(orderId)}/reply`, { subject, message }, { token });
      const delivery = response?.delivery;
      const deliverySuffix = delivery?.sent
        ? ""
        : ` Reply saved in admin history${delivery?.reason ? ` (${String(delivery.reason)})` : ""}.`;
      setDashboardNotice({ tone: "success", message: `Reply processed for ${order.email || order.name || "customer"}.${deliverySuffix}` });
      setActiveOrderReplyId(null);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  function getMessageReplyDefaults(item) {
    return {
      subject: `Re: ${String(item?.subject || "Your message").trim()}`,
        message: `Hello ${String(item?.name || "Customer")},\n\nThank you for your message. We have reviewed your complaint/inquiry and will support you promptly.\n\nBest regards,\nAura Salon`
    };
  }

  function toggleMessageReply(item) {
    const messageId = String(item?.id || "");
    if (!messageId) return;

    setMessageReplyDrafts((prev) => {
      if (prev[messageId]) return prev;
      return { ...prev, [messageId]: getMessageReplyDefaults(item) };
    });

    setActiveMessageReplyId((prev) => (prev === messageId ? null : messageId));
  }

  function updateMessageReplyDraft(messageId, field, value) {
    setMessageReplyDrafts((prev) => ({
      ...prev,
      [messageId]: {
        ...(prev[messageId] || {}),
        [field]: value
      }
    }));
  }

  async function saveMessageStatus(id, status) {
    try {
      await apiPut(`/api/admin/messages/${encodeURIComponent(id)}`, { status }, { token });
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  async function sendMessageReply(item) {
    const messageId = String(item?.id || "");
    if (!messageId) return;

    const draft = messageReplyDrafts[messageId] || getMessageReplyDefaults(item);
    const subject = String(draft.subject || "").trim();
    const message = String(draft.message || "").trim();

    if (!subject || !message) {
      setDashboardNotice({ tone: "error", message: "Reply subject and message are required." });
      return;
    }

    try {
      const response = await apiPost(`/api/admin/messages/${encodeURIComponent(messageId)}/reply`, { subject, message }, { token });
      const delivery = response?.delivery;
      const deliverySuffix = delivery?.sent
        ? ""
        : ` Reply saved in admin history${delivery?.reason ? ` (${String(delivery.reason)})` : ""}.`;
      setDashboardNotice({ tone: "success", message: `Reply processed for ${item.email || "customer"}.${deliverySuffix}` });
      setActiveMessageReplyId(null);
      await refreshDashboard();
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    }
  }

  const pendingBookings = dashboard.bookings.filter((item) => ["pending", "new"].includes(String(item.status || "").toLowerCase()));
  const approvedBookings = useMemo(
    () => dashboard.bookings.filter((item) => normalizeStatus(item.status) === "approved"),
    [dashboard.bookings]
  );
  const pendingApprovalBookings = useMemo(
    () => dashboard.bookings.filter((item) => ["pending", "new"].includes(normalizeStatus(item.status))),
    [dashboard.bookings]
  );
  const focusedBooking = useMemo(
    () => dashboard.bookings.find((item) => String(item?.id || "") === String(focusedBookingId || "")) || null,
    [dashboard.bookings, focusedBookingId]
  );
  const pendingOrders = dashboard.orders.filter((item) => ["pending", "new"].includes(String(item.status || "").toLowerCase()));
  const newRequestEntries = useMemo(() => {
    const bookingEntries = pendingBookings.map((item) => ({
      kind: "booking",
      id: item.id,
      createdAt: item.createdAt || `${item.date || ""}T${item.time || "00:00"}`,
      data: item
    }));

    const orderEntries = pendingOrders.map((item) => ({
      kind: "order",
      id: item.id,
      createdAt: item.createdAt || item.date || "",
      data: item
    }));

    return [...bookingEntries, ...orderEntries].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [pendingBookings, pendingOrders]);
  const filteredBookings = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();
    return dashboard.bookings.filter((item) => {
      const statusValue = normalizeStatus(item.status);
      const statusMatch = bookingStatusFilter === "all" || statusValue === bookingStatusFilter;
      const searchable = [item.id, item.name, item.phone, item.serviceName, item.date, item.time].join(" ").toLowerCase();
      const queryMatch = !query || searchable.includes(query);
      const itemDate = getItemDate(item);
      const dateMatch = !bookingDateFilter || itemDate.includes(bookingDateFilter);
      return statusMatch && queryMatch && dateMatch;
    });
  }, [dashboard.bookings, bookingDateFilter, bookingSearch, bookingStatusFilter]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return dashboard.orders.filter((item) => {
      const statusValue = normalizeStatus(item.status);
      const statusMatch = orderStatusFilter === "all" || statusValue === orderStatusFilter;
      const searchable = [item.id, item.orderCode, item.name, item.email, item.phone, item.deliverySpeed, item.address, item.date].join(" ").toLowerCase();
      const queryMatch = !query || searchable.includes(query);
      const itemDate = getItemDate(item);
      const dateMatch = !orderDateFilter || itemDate.includes(orderDateFilter);
      return statusMatch && queryMatch && dateMatch;
    });
  }, [dashboard.orders, orderDateFilter, orderSearch, orderStatusFilter]);

  const filteredMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    return dashboard.messages.filter((item) => {
      const statusValue = normalizeStatus(item.status);
      const statusMatch = messageStatusFilter === "all" || statusValue === messageStatusFilter;
      const typeMatch = messageTypeFilter === "all"
        ? true
        : messageTypeFilter === "complaints"
          ? isComplaintReportType(item.reportType)
          : !isComplaintReportType(item.reportType);
      const searchable = [item.id, item.name, item.email, item.subject, item.message, item.reportType].join(" ").toLowerCase();
      const queryMatch = !query || searchable.includes(query);
      return statusMatch && typeMatch && queryMatch;
    });
  }, [dashboard.messages, messageSearch, messageStatusFilter, messageTypeFilter]);

  const bookingPages = Math.max(1, Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE));
  const orderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const newRequestPages = Math.max(1, Math.ceil(newRequestEntries.length / newRequestsPageSize));
  const bookingSlice = filteredBookings.slice((bookingsPage - 1) * BOOKINGS_PER_PAGE, bookingsPage * BOOKINGS_PER_PAGE);
  const orderSlice = filteredOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);
  const newRequestSlice = newRequestEntries.slice((newRequestsPage - 1) * newRequestsPageSize, newRequestsPage * newRequestsPageSize);

  useEffect(() => {
    setBookingsPage((prev) => Math.min(prev, bookingPages));
  }, [bookingPages]);

  useEffect(() => {
    setOrdersPage((prev) => Math.min(prev, orderPages));
  }, [orderPages]);

  useEffect(() => {
    setNewRequestsPage((prev) => Math.min(prev, newRequestPages));
  }, [newRequestPages]);

  const dueNowTotal = useMemo(
    () => dashboard.bookings.reduce((sum, item) => sum + Number(item.amountDueNow || 0), 0),
    [dashboard.bookings]
  );

  const overduePendingCount = useMemo(() => {
    const now = Date.now();
    const thresholdMs = 24 * 60 * 60 * 1000;

    const isOverduePending = (item) => {
      const status = String(item?.status || "").trim().toLowerCase();
      if (!status || !["pending", "new"].includes(status)) return false;
      const createdAtMs = Date.parse(String(item?.createdAt || ""));
      if (!Number.isFinite(createdAtMs)) return false;
      return (now - createdAtMs) >= thresholdMs;
    };

    const overdueBookings = dashboard.bookings.filter(isOverduePending).length;
    const overdueOrders = dashboard.orders.filter(isOverduePending).length;
    return overdueBookings + overdueOrders;
  }, [dashboard.bookings, dashboard.orders]);

  const unreadMessagesCount = useMemo(
    () => dashboard.messages.filter((item) => normalizeStatus(item.status) === "unread").length,
    [dashboard.messages]
  );

  const orderRevenueTotal = useMemo(
    () => dashboard.orders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [dashboard.orders]
  );

  const operationsDateBookings = useMemo(() => {
    return dashboard.bookings
      .filter((item) => {
        const bookingDate = String(item?.date || "").trim();
        if (bookingDate) return bookingDate === operationsDate;
        return toDateKey(item?.createdAt) === operationsDate;
      })
      .sort((a, b) => String(a?.time || "").localeCompare(String(b?.time || "")));
  }, [dashboard.bookings, operationsDate]);

  const operationsDateOrders = useMemo(() => {
    return dashboard.orders
      .filter((item) => toDateKey(item?.createdAt || item?.date) === operationsDate)
      .sort((a, b) => new Date(String(a?.createdAt || 0)).getTime() - new Date(String(b?.createdAt || 0)).getTime());
  }, [dashboard.orders, operationsDate]);

  const operationsDateMessages = useMemo(() => {
    return dashboard.messages.filter((item) => toDateKey(item?.createdAt) === operationsDate);
  }, [dashboard.messages, operationsDate]);

  const operationsRevenue = useMemo(() => {
    const bookingValue = operationsDateBookings.reduce((sum, item) => sum + Number(item?.amountDueNow || 0), 0);
    const orderValue = operationsDateOrders.reduce((sum, item) => sum + Number(item?.totalAmount || 0), 0);
    return bookingValue + orderValue;
  }, [operationsDateBookings, operationsDateOrders]);

  const operationsCompletionRate = useMemo(() => {
    const completedBookings = operationsDateBookings.filter((item) => ["approved", "completed"].includes(String(item?.status || "").toLowerCase())).length;
    const completedOrders = operationsDateOrders.filter((item) => ["delivered", "completed", "on_the_way", "shipped"].includes(String(item?.status || "").toLowerCase())).length;
    const total = operationsDateBookings.length + operationsDateOrders.length;
    if (!total) return 0;
    return Math.round(((completedBookings + completedOrders) / total) * 100);
  }, [operationsDateBookings, operationsDateOrders]);

  const operationsBookingApprovalRate = useMemo(() => {
    const total = operationsDateBookings.length;
    if (!total) return 0;
    const approvedCount = operationsDateBookings.filter((item) => ["approved", "completed"].includes(normalizeStatus(item?.status))).length;
    return Math.round((approvedCount / total) * 100);
  }, [operationsDateBookings]);

  const averageOrderValue = useMemo(() => {
    if (!dashboard.orders.length) return 0;
    return Math.round(orderRevenueTotal / Math.max(1, dashboard.orders.length));
  }, [dashboard.orders.length, orderRevenueTotal]);

  const executiveHealthSignal = useMemo(() => {
    if (overduePendingCount > 12) return { tone: "text-danger", label: "Critical" };
    if (overduePendingCount > 4) return { tone: "text-warning", label: "Needs attention" };
    return { tone: "text-success", label: "Healthy" };
  }, [overduePendingCount]);

  const operationsStaffOptions = useMemo(() => {
    const values = String(operationsStaffInput || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return values.length ? values : DEFAULT_STAFF_INPUT.split(",").map((item) => item.trim());
  }, [operationsStaffInput]);

  const operationsAssignmentValidation = useMemo(() => {
    const issuesByBookingId = {};
    const staffSlotMap = new Map();
    const chairSlotMap = new Map();
    let missingAssignments = 0;

    operationsDateBookings.forEach((item) => {
      const bookingId = String(item?.id || "").trim();
      if (!bookingId) return;

      const assignment = bookingAssignments[bookingId] || {};
      const staff = String(assignment?.staff || "").trim();
      const chair = String(assignment?.chair || "").trim();
      const time = String(item?.time || "unscheduled").trim() || "unscheduled";

      if (!staff || !chair) {
        missingAssignments += 1;
        issuesByBookingId[bookingId] = [
          ...(issuesByBookingId[bookingId] || []),
          !staff && !chair
            ? "Assign both staff and chair"
            : !staff
              ? "Assign a staff member"
              : "Assign a chair"
        ];
      }

      if (staff) {
        const staffKey = `${time}__${staff.toLowerCase()}`;
        staffSlotMap.set(staffKey, [...(staffSlotMap.get(staffKey) || []), bookingId]);
      }

      if (chair) {
        const chairKey = `${time}__${chair}`;
        chairSlotMap.set(chairKey, [...(chairSlotMap.get(chairKey) || []), bookingId]);
      }
    });

    let staffConflicts = 0;
    let chairConflicts = 0;

    staffSlotMap.forEach((bookingIds) => {
      if (bookingIds.length <= 1) return;
      staffConflicts += bookingIds.length;
      bookingIds.forEach((bookingId) => {
        issuesByBookingId[bookingId] = [
          ...(issuesByBookingId[bookingId] || []),
          "Staff conflict at same time"
        ];
      });
    });

    chairSlotMap.forEach((bookingIds) => {
      if (bookingIds.length <= 1) return;
      chairConflicts += bookingIds.length;
      bookingIds.forEach((bookingId) => {
        issuesByBookingId[bookingId] = [
          ...(issuesByBookingId[bookingId] || []),
          "Chair conflict at same time"
        ];
      });
    });

    const uniqueIssuesByBookingId = Object.fromEntries(
      Object.entries(issuesByBookingId).map(([bookingId, issues]) => [
        bookingId,
        [...new Set(issues)]
      ])
    );

    const bookingsWithIssues = Object.keys(uniqueIssuesByBookingId).length;

    return {
      issuesByBookingId: uniqueIssuesByBookingId,
      missingAssignments,
      staffConflicts,
      chairConflicts,
      bookingsWithIssues,
      isHealthy: bookingsWithIssues === 0
    };
  }, [bookingAssignments, operationsDateBookings]);

  const slotLoadSummary = useMemo(() => {
    const slotCounts = new Map();
    operationsDateBookings.forEach((item) => {
      const timeKey = String(item?.time || "unscheduled").trim() || "unscheduled";
      slotCounts.set(timeKey, (slotCounts.get(timeKey) || 0) + 1);
    });

    let peakSlotTime = "--";
    let peakSlotLoad = 0;
    slotCounts.forEach((count, time) => {
      if (count > peakSlotLoad) {
        peakSlotLoad = count;
        peakSlotTime = time;
      }
    });

    const capacity = Math.max(1, Number(operationsChairCapacity || 1));
    const peakUtilization = peakSlotLoad > 0 ? Math.round((peakSlotLoad / capacity) * 100) : 0;

    return {
      peakSlotTime,
      peakSlotLoad,
      peakUtilization
    };
  }, [operationsDateBookings, operationsChairCapacity]);

  const customerPulse = useMemo(() => {
    const aggregate = new Map();

    const addEntry = ({ email, name, amount }) => {
      const key = String(email || "").trim().toLowerCase();
      if (!key) return;
      const existing = aggregate.get(key) || { email: key, name: String(name || "Customer").trim() || "Customer", visits: 0, value: 0 };
      existing.visits += 1;
      existing.value += Number(amount || 0);
      if (!existing.name || existing.name === "Customer") {
        existing.name = String(name || "Customer").trim() || "Customer";
      }
      aggregate.set(key, existing);
    };

    dashboard.bookings.forEach((item) => {
      addEntry({ email: item?.email, name: item?.name, amount: item?.amountDueNow || 0 });
    });

    dashboard.orders.forEach((item) => {
      addEntry({ email: item?.email, name: item?.name, amount: item?.totalAmount || 0 });
    });

    return Array.from(aggregate.values())
      .sort((a, b) => (b.visits - a.visits) || (b.value - a.value))
      .slice(0, 5);
  }, [dashboard.bookings, dashboard.orders]);

  const selectedBookingCount = selectedBookingIds.length;
  const selectedOrderCount = selectedOrderIds.length;
  const adminRole = String(adminIdentity?.role || "ops").trim().toLowerCase() || "ops";
  const canViewModerationAudit = adminRole === "super-admin";
  const moderationActivityCount = useMemo(
    () => moderationAuditLogs.filter((item) => {
      const action = String(item?.action || "").toLowerCase();
      return action.includes("reply") || action.includes("message") || action.includes("booking") || action.includes("order");
    }).length,
    [moderationAuditLogs]
  );
  const activeSection = useMemo(() => {
    const pathname = String(location.pathname || "");
    const section = ADMIN_SECTIONS.find((item) => pathname.endsWith(`/${item.path}`));
    return (section || getAdminSection("overview")).key;
  }, [location.pathname]);
  const sectionCounts = useMemo(
    () => ({
      overview: pendingBookings.length + pendingOrders.length,
      bookings: pendingBookings.length,
      orders: pendingOrders.length,
      messages: unreadMessagesCount,
      products: dashboard.products.length,
      settings: null
    }),
    [dashboard.products.length, pendingBookings.length, pendingOrders.length, unreadMessagesCount]
  );

  function renderBookingReplyComposer(item) {
    const bookingId = String(item?.id || "");
    if (!bookingId) return null;

    const isOpen = activeBookingReplyId === bookingId;
    const historyOpen = activeBookingHistoryId === bookingId;
    const draft = bookingReplyDrafts[bookingId] || getBookingReplyDefaults(item);
    const replyHistory = Array.isArray(item.replies) ? [...item.replies].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()) : [];
    const historyQuery = String(bookingHistorySearch[bookingId] || "").trim().toLowerCase();
    const filteredHistory = !historyQuery
      ? replyHistory
      : replyHistory.filter((reply) => {
        const text = [reply.subject, reply.message, reply.admin?.name, reply.admin?.email].join(" ").toLowerCase();
        return text.includes(historyQuery);
      });
    const phoneDigits = String(item.phone || "").replace(/[^\d+]/g, "");
    const callHref = phoneDigits ? `tel:${phoneDigits}` : "";
    const phoneText = String(item.phone || "").trim();
    const emailAddress = String(item.email || "").trim();
    const bookingCode = String(item.id || "").trim();
    const emailHref = emailAddress
      ? `mailto:${emailAddress}?subject=${encodeURIComponent(`Booking update ${bookingCode ? `(${bookingCode})` : ""}`.trim())}`
      : "";
    const whatsappDigits = normalizeWhatsAppNumber(item.phone);
    const whatsappMessage = encodeURIComponent(`Hello ${String(item.name || "")}, this is Aura Salon regarding your booking (${String(item.id || "")}).`);
    const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${whatsappMessage}` : "";

    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={() => toggleBookingReply(item)}>
              {isOpen ? "Close reply" : "Reply to booking"}
            </Button>
            <Button type="button" variant="outline" onClick={() => toggleBookingHistory(bookingId)}>
              {historyOpen ? "Hide reply history" : `View reply history (${replyHistory.length})`}
            </Button>
            {callHref ? (
              <a href={callHref} className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
                Call booker
              </a>
            ) : null}
            {phoneText ? (
              <Button type="button" variant="outline" onClick={() => copyContactValue(phoneText, "Phone number")}>
                Copy phone
              </Button>
            ) : null}
            {emailHref ? (
              <a href={emailHref} className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
                Email booker
              </a>
            ) : null}
            {emailAddress ? (
              <Button type="button" variant="outline" onClick={() => copyContactValue(emailAddress, "Email address")}>
                Copy email
              </Button>
            ) : null}
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
                WhatsApp
              </a>
            ) : null}
          </div>
          {item.lastRepliedAt ? (
            <span className="text-xs text-ink-soft">Last reply: {new Date(item.lastRepliedAt).toLocaleString()}</span>
          ) : null}
        </div>

        {historyOpen ? (
          <div className="space-y-2 rounded-[1.1rem] border border-line/70 bg-panel/85 p-3">
            {replyHistory.length > 0 ? (
              <input
                className="h-10 w-full rounded-2xl border border-line bg-panel/92 px-3 text-sm text-ink"
                placeholder="Search reply history by subject, message, or admin..."
                value={bookingHistorySearch[bookingId] || ""}
                onChange={(event) => updateBookingHistorySearch(bookingId, event.target.value)}
              />
            ) : null}
            {replyHistory.length === 0 ? (
              <EmptyState title="No replies yet" description="Replies you send from admin will appear here." />
            ) : filteredHistory.length === 0 ? (
              <EmptyState title="No matching replies" description="Try another keyword for this booking's reply history." />
            ) : (
              filteredHistory.map((reply, index) => (
                <div key={reply.id || `${bookingId}-reply-${index}`} className="rounded-xl border border-line/70 bg-panel/92 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{reply.subject || "Booking reply"}</p>
                    <span className="text-xs text-ink-soft">{reply.sentAt ? new Date(reply.sentAt).toLocaleString() : "Unknown time"}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{reply.message || ""}</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    By {reply.admin?.name || "Admin"}{reply.admin?.email ? ` (${reply.admin.email})` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : null}

        {isOpen ? (
          <div className="space-y-3 rounded-[1.1rem] border border-line/70 bg-panel/80 p-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => applyBookingTemplate(item, "reschedule")}>Reschedule template</Button>
              <Button type="button" variant="outline" onClick={() => applyBookingTemplate(item, "reminder")}>Appointment reminder</Button>
            </div>
            <TextField
              label="Reply subject"
              id={`booking-reply-subject-${bookingId}`}
              value={draft.subject || ""}
              onChange={(event) => updateBookingReplyDraft(bookingId, "subject", event.target.value)}
            />
            <div>
              <label htmlFor={`booking-reply-message-${bookingId}`} className="mb-2 block text-sm font-semibold text-ink">Reply message</label>
              <textarea
                id={`booking-reply-message-${bookingId}`}
                rows={4}
                autoFocus
                className="w-full rounded-2xl border border-line bg-panel/92 px-3 py-2 text-sm text-ink"
                value={draft.message || ""}
                onChange={(event) => updateBookingReplyDraft(bookingId, "message", event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => sendBookingReply(item)}>Send reply email</Button>
              <Button type="button" variant="outline" onClick={() => setActiveBookingReplyId(null)}>Cancel</Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderMessageReplyComposer(item) {
    const messageId = String(item?.id || "");
    if (!messageId) return null;
    const isOpen = activeMessageReplyId === messageId;
    const draft = messageReplyDrafts[messageId] || getMessageReplyDefaults(item);

    return (
      <div className="mt-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => toggleMessageReply(item)}>
            {isOpen ? "Close reply" : "Reply via email"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => saveMessageStatus(item.id, normalizeStatus(item.status) === "read" ? "unread" : "read")}
          >
            Mark as {normalizeStatus(item.status) === "read" ? "unread" : "read"}
          </Button>
        </div>

        {isOpen ? (
          <div className="space-y-3 rounded-[1.1rem] border border-line/70 bg-panel/80 p-3">
            <TextField
              label="Reply subject"
              id={`message-reply-subject-${messageId}`}
              value={draft.subject || ""}
              onChange={(event) => updateMessageReplyDraft(messageId, "subject", event.target.value)}
            />
            <div>
              <label htmlFor={`message-reply-body-${messageId}`} className="mb-2 block text-sm font-semibold text-ink">Reply message</label>
              <textarea
                id={`message-reply-body-${messageId}`}
                rows={4}
                className="w-full rounded-2xl border border-line bg-panel/92 px-3 py-2 text-sm text-ink"
                value={draft.message || ""}
                onChange={(event) => updateMessageReplyDraft(messageId, "message", event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => sendMessageReply(item)}>Send complaint reply</Button>
              <Button type="button" variant="outline" onClick={() => setActiveMessageReplyId(null)}>Cancel</Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderOrderContactActions(item) {
    const phoneDigits = String(item?.phone || "").replace(/[^\d+]/g, "");
    const callHref = phoneDigits ? `tel:${phoneDigits}` : "";
    const phoneText = String(item?.phone || "").trim();
    const emailAddress = String(item?.email || "").trim();
    const orderCode = String(item?.orderCode || item?.id || "").trim();
    const emailHref = emailAddress
      ? `mailto:${emailAddress}?subject=${encodeURIComponent(`Order update ${orderCode ? `(${orderCode})` : ""}`.trim())}`
      : "";
    const whatsappDigits = normalizeWhatsAppNumber(item?.phone);
    const whatsappMessage = encodeURIComponent(`Hello ${String(item?.name || "")}, this is Aura Salon regarding your order (${orderCode}).`);
    const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${whatsappMessage}` : "";

    if (!callHref && !emailHref && !whatsappHref) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {callHref ? (
          <a href={callHref} className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
            Call customer
          </a>
        ) : null}
        {phoneText ? (
          <Button type="button" variant="outline" onClick={() => copyContactValue(phoneText, "Phone number")}>
            Copy phone
          </Button>
        ) : null}
        {emailHref ? (
          <Button type="button" variant="outline" onClick={() => toggleOrderReply(item)}>
            {activeOrderReplyId === String(item?.id || "") ? "Close email" : "Email customer"}
          </Button>
        ) : null}
        {emailAddress ? (
          <Button type="button" variant="outline" onClick={() => copyContactValue(emailAddress, "Email address")}>
            Copy email
          </Button>
        ) : null}
        {emailHref ? (
          <a href={emailHref} className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
            Open mail app
          </a>
        ) : null}
        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-panel/92 px-4 text-sm font-semibold text-ink hover:bg-brand-light/20">
            WhatsApp
          </a>
        ) : null}
      </div>
    );
  }

  function renderOrderReplyComposer(item) {
    const orderId = String(item?.id || "");
    if (!orderId || activeOrderReplyId !== orderId) return null;

    const draft = orderReplyDrafts[orderId] || getOrderReplyDefaults(item);
    const replyHistory = Array.isArray(item.replies)
      ? [...item.replies].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
      : [];

    return (
      <div className="mt-3 space-y-3 rounded-[1.1rem] border border-line/70 bg-panel/80 p-3">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => applyOrderTemplate(item, "delivery")}>Delivery update template</Button>
        </div>
        <TextField
          label="Reply subject"
          id={`order-reply-subject-${orderId}`}
          value={draft.subject || ""}
          onChange={(event) => updateOrderReplyDraft(orderId, "subject", event.target.value)}
        />
        <div>
          <label htmlFor={`order-reply-message-${orderId}`} className="mb-2 block text-sm font-semibold text-ink">Reply message</label>
          <textarea
            id={`order-reply-message-${orderId}`}
            rows={4}
            autoFocus
            className="w-full rounded-2xl border border-line bg-panel/92 px-3 py-2 text-sm text-ink"
            value={draft.message || ""}
            onChange={(event) => updateOrderReplyDraft(orderId, "message", event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => sendOrderReply(item)}>Send order email</Button>
          <Button type="button" variant="outline" onClick={() => setActiveOrderReplyId(null)}>Cancel</Button>
        </div>
        {replyHistory.length > 0 ? (
          <div className="rounded-xl border border-line/70 bg-panel/92 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">Recent replies</p>
            <div className="mt-2 space-y-2">
              {replyHistory.slice(0, 3).map((reply, index) => (
                <div key={reply.id || `${orderId}-reply-${index}`} className="rounded-lg border border-line/70 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{reply.subject || "Order reply"}</p>
                    <span className="text-xs text-ink-soft">{reply.sentAt ? new Date(reply.sentAt).toLocaleString() : "Unknown time"}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft whitespace-pre-wrap">{reply.message || ""}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function focusPendingBookings() {
    navigate("/admin/bookings");
    setBookingStatusFilter("pending");
    setBookingsPage(1);
  }

  function focusPendingOrders() {
    navigate("/admin/orders");
    setOrderStatusFilter("pending");
    setOrdersPage(1);
  }

  function focusUnreadMessages() {
    navigate("/admin/messages");
    setMessageStatusFilter("unread");
  }

  function focusProductsManagement() {
    navigate("/admin/products");
  }

  function updateBookingAssignment(item, field, value) {
    const bookingId = String(item?.id || "").trim();
    const normalizedId = String(bookingId || "").trim();
    if (!normalizedId) return;

    const bookingStatus = String(item?.status || "").trim().toLowerCase();

    let shouldAutoNotify = false;
    let nextAssignmentSnapshot = null;

    setBookingAssignments((prev) => {
      const previousAssignment = prev[normalizedId] || {};
      const nextAssignment = {
        ...previousAssignment,
        [field]: value
      };

      const hadCompleteAssignment = Boolean(
        String(previousAssignment?.staff || "").trim() &&
          String(previousAssignment?.chair || "").trim()
      );
      const nowHasCompleteAssignment = Boolean(
        String(nextAssignment?.staff || "").trim() &&
          String(nextAssignment?.chair || "").trim()
      );

      shouldAutoNotify = ["pending", "new"].includes(bookingStatus) && !hadCompleteAssignment && nowHasCompleteAssignment;
      nextAssignmentSnapshot = nextAssignment;

      return {
        ...prev,
        [normalizedId]: nextAssignment
      };
    });

    if (shouldAutoNotify && nextAssignmentSnapshot) {
      notifyBookingAssignment(item, nextAssignmentSnapshot);
    }
  }

  async function notifyBookingAssignment(item, assignmentOverride = null) {
    const bookingId = String(item?.id || "").trim();
    if (!bookingId) return;

    if (!token) {
      setDashboardNotice({ tone: "error", message: "Admin session is missing. Please login again." });
      return;
    }

    const assignment = assignmentOverride && typeof assignmentOverride === "object"
      ? assignmentOverride
      : (bookingAssignments[bookingId] || {});
    const staff = String(assignment?.staff || "").trim();
    const chair = String(assignment?.chair || "").trim();
    const date = String(item?.date || operationsDate || "").trim();
    const time = String(item?.time || "").trim();

    if (!staff || !chair) {
      setDashboardNotice({ tone: "error", message: "Assign both staff and chair before notifying the customer." });
      return;
    }

    setAssignmentNotifyBusyByBookingId((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const response = await apiPost(
        `/api/admin/bookings/${encodeURIComponent(bookingId)}/assignment-notify`,
        { staff, chair, date, time, sendSms: true, sendEmail: true },
        { token }
      );

      const responseAssignment = response && typeof response.assignment === "object"
        ? response.assignment
        : null;
      const assignmentDate = String(responseAssignment?.date || date || String(item?.date || operationsDate || "")).trim();
      const assignmentTime = String(responseAssignment?.time || time || String(item?.time || "")).trim();
      const assignmentStaff = String(responseAssignment?.staff || staff).trim();
      const assignmentChair = String(responseAssignment?.chair || chair).trim();
      const responseStatus = String(response?.bookingStatus || "").trim().toLowerCase();
      const currentStatus = String(item?.status || "").trim().toLowerCase();
      const nextStatus = responseStatus || (["pending", "new"].includes(currentStatus) ? "approved" : currentStatus || "pending");
      const nowIso = new Date().toISOString();

      setDashboard((prev) => ({
        ...prev,
        bookings: Array.isArray(prev.bookings)
          ? prev.bookings.map((booking) => {
            if (String(booking?.id || "") !== bookingId) return booking;
            return {
              ...booking,
              status: nextStatus,
              updatedAt: nowIso,
              lastAssignment: {
                staff: assignmentStaff,
                chair: assignmentChair,
                date: assignmentDate,
                time: assignmentTime,
                notifiedAt: nowIso
              }
            };
          })
          : prev.bookings
      }));

      setRecentlyApprovedBookingIds((prev) => ({ ...prev, [bookingId]: true }));
      const existingTimer = approvalFlashTimersRef.current[bookingId];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      approvalFlashTimersRef.current[bookingId] = setTimeout(() => {
        setRecentlyApprovedBookingIds((prev) => {
          const next = { ...prev };
          delete next[bookingId];
          return next;
        });
        delete approvalFlashTimersRef.current[bookingId];
      }, 2200);

      const smsNotice = response?.notifications?.sms?.sent
        ? "SMS sent"
        : `SMS: ${String(response?.notifications?.sms?.reason || "not sent")}`;
      const emailNotice = response?.notifications?.email?.sent
        ? "Email sent"
        : `Email: ${String(response?.notifications?.email?.reason || "not sent")}`;
      const approvalNotice = response?.autoApproved
        ? "Booking moved from Pending to Approved."
        : "Booking assignment updated.";

      setDashboardNotice({
        tone: "success",
        message: `${approvalNotice} Assignment shared with ${String(item?.name || "customer")}. ${smsNotice}. ${emailNotice}.`
      });
    } catch (error) {
      setDashboardNotice({ tone: "error", message: getErrorMessage(error) });
    } finally {
      setAssignmentNotifyBusyByBookingId((prev) => ({ ...prev, [bookingId]: false }));
    }
  }

  function handleSignOut() {
    setToken("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  }

  function toggleAutoRefresh() {
    setAutoRefreshEnabled((prev) => !prev);
  }

  function exportBookingsCsv() {
    if (!filteredBookings.length) {
      setDashboardNotice({ tone: "error", message: "No filtered bookings available to export." });
      return;
    }

    downloadCsv(
      "bookings-export.csv",
      filteredBookings.map((item) => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        service: item.serviceName,
        date: item.date,
        time: item.time,
        amountDueNow: item.amountDueNow,
        status: item.status
      }))
    );
    setDashboardNotice({ tone: "success", message: "Bookings CSV exported." });
  }

  function exportOrdersCsv() {
    if (!filteredOrders.length) {
      setDashboardNotice({ tone: "error", message: "No filtered orders available to export." });
      return;
    }

    downloadCsv(
      "orders-export.csv",
      filteredOrders.map((item) => ({
        id: item.id,
        orderCode: item.orderCode,
        customer: item.name,
        deliverySpeed: item.deliverySpeed,
        totalAmount: item.totalAmount,
        status: item.status
      }))
    );
    setDashboardNotice({ tone: "success", message: "Orders CSV exported." });
  }

  function renderAnimatedAdminBackground() {
    const imageLayerActive = activeBackgroundLayer === 1;
    const imageLayerTwoActive = activeBackgroundLayer === 2;
    const imageLayerThreeActive = activeBackgroundLayer === 3;
    const imageLayerFourActive = activeBackgroundLayer === 4;
    const videoLayerActive = activeBackgroundLayer === 0;

    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${ADMIN_BACKGROUND_FALLBACK_IMAGE_URL}')` }}
          aria-hidden="true"
        />

        <div
          className={`pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${imageLayerActive ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url('${ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL}')`,
            transform: imageLayerActive ? "scale(1.03)" : "scale(1.06)"
          }}
          aria-hidden="true"
        />

        <div
          className={`pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${imageLayerTwoActive ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url('${ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_2}')`,
            transform: imageLayerTwoActive ? "scale(1.03)" : "scale(1.06)"
          }}
          aria-hidden="true"
        />

        <div
          className={`pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${imageLayerThreeActive ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url('${ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_3}')`,
            transform: imageLayerThreeActive ? "scale(1.03)" : "scale(1.06)"
          }}
          aria-hidden="true"
        />

        <div
          className={`pointer-events-none absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${imageLayerFourActive ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url('${ADMIN_BACKGROUND_INTERCHANGE_IMAGE_URL_4}')`,
            transform: imageLayerFourActive ? "scale(1.03)" : "scale(1.06)"
          }}
          aria-hidden="true"
        />

        {!backgroundVideoFailed ? (
          <video
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${videoLayerActive ? "opacity-100" : "opacity-0"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setBackgroundVideoFailed(true)}
            aria-hidden="true"
          >
            <source src={ADMIN_BACKGROUND_VIDEO_URL} type="video/mp4" />
          </video>
        ) : null}

        <div className="pointer-events-none absolute inset-0 bg-black/46" />
      </>
    );
  }

  if (!token) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-canvas px-4 py-6 text-ink sm:px-6 sm:py-10">
        <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-brand-light/35 blur-3xl" />
        {renderAnimatedAdminBackground()}

        <div className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-deep/75">Admin</p>
              <h1 className="font-display text-4xl text-ink sm:text-5xl">Admin command center</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Button asChild variant="outline">
                <Link to="/">Back to site</Link>
              </Button>
            </div>
          </div>
          <Notice tone={authNotice?.tone} message={authNotice?.message} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Surface className="space-y-5">
              <SectionHeading eyebrow="Login" title="Admin access" description="This replaces the old injected admin HTML view." />
              <form className="space-y-4" onSubmit={handleLogin}>
                <TextField label="Email" id="login-email" type="email" required value={login.email} onChange={(event) => setLogin((prev) => ({ ...prev, email: event.target.value }))} />
                <div className="space-y-2">
                  <label htmlFor="login-password" className="text-sm font-semibold text-ink">Password *</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={login.password}
                      onChange={(event) => setLogin((prev) => ({ ...prev, password: event.target.value }))}
                      className="h-11 w-full rounded-[1.35rem] border border-line bg-panel/88 px-4 pr-12 text-sm text-ink shadow-sm backdrop-blur-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      title={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-passcode" className="text-sm font-semibold text-ink">Admin secret code *</label>
                  <div className="relative">
                    <input
                      id="login-passcode"
                      type={showLoginPasscode ? "text" : "password"}
                      required
                      value={login.secretPasscode}
                      onChange={(event) => setLogin((prev) => ({ ...prev, secretPasscode: event.target.value }))}
                      className="h-11 w-full rounded-[1.35rem] border border-line bg-panel/88 px-4 pr-12 text-sm text-ink shadow-sm backdrop-blur-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPasscode((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                      aria-label={showLoginPasscode ? "Hide secret code" : "Show secret code"}
                      title={showLoginPasscode ? "Hide secret code" : "Show secret code"}
                    >
                      {showLoginPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-otp" className="text-sm font-semibold text-ink">One-time code *</label>
                  <input
                    id="login-otp"
                    type="text"
                    required
                    value={login.oneTimeCode}
                    onChange={(event) => setLogin((prev) => ({ ...prev, oneTimeCode: event.target.value }))}
                    className="h-11 w-full rounded-[1.35rem] border border-line bg-panel/88 px-4 text-sm text-ink shadow-sm backdrop-blur-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                    placeholder="Enter OTP from admin or override inbox"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs leading-5 text-ink-soft">Step 1: enter admin secret code and click Send one-time code. Step 2: check the inbox shown in the success message; override inbox is used when configured.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="w-full sm:w-auto" type="button" variant="outline" onClick={handleRequestLoginOtp} disabled={requestingLoginOtp}>
                    {requestingLoginOtp ? "Sending code..." : "Send one-time code"}
                  </Button>
                  <Button className="w-full sm:w-auto" type="submit">Login</Button>
                </div>
              </form>
            </Surface>
            <Surface className="space-y-5">
              <SectionHeading eyebrow="Register" title="Register admin" description="Use the admin secret code to add another admin account." />
              {registrationOpen ? (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <TextField label="Name" id="register-name" required value={register.name} onChange={(event) => setRegister((prev) => ({ ...prev, name: event.target.value }))} />
                  <TextField label="Email" id="register-email" type="email" required value={register.email} onChange={(event) => setRegister((prev) => ({ ...prev, email: event.target.value }))} />
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="text-sm font-semibold text-ink">Password *</label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        required
                        value={register.password}
                        onChange={(event) => setRegister((prev) => ({ ...prev, password: event.target.value }))}
                        className="h-11 w-full rounded-[1.35rem] border border-line bg-panel/88 px-4 pr-12 text-sm text-ink shadow-sm backdrop-blur-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                        aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                        title={showRegisterPassword ? "Hide password" : "Show password"}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-passcode" className="text-sm font-semibold text-ink">Secret passcode *</label>
                    <div className="relative">
                      <input
                        id="register-passcode"
                        type={showRegisterPasscode ? "text" : "password"}
                        required
                        value={register.secretPasscode}
                        onChange={(event) => setRegister((prev) => ({ ...prev, secretPasscode: event.target.value }))}
                        className="h-11 w-full rounded-[1.35rem] border border-line bg-panel/88 px-4 pr-12 text-sm text-ink shadow-sm backdrop-blur-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPasscode((prev) => !prev)}
                        className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-soft transition hover:text-ink"
                        aria-label={showRegisterPasscode ? "Hide secret passcode" : "Show secret passcode"}
                        title={showRegisterPasscode ? "Hide secret passcode" : "Show secret passcode"}
                      >
                        {showRegisterPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto" type="submit">Register admin</Button>
                </form>
              ) : (
                <EmptyState title="Registration unavailable" description="Admin registration is not available right now." />
              )}
            </Surface>
          </div>
        </div>
        </div>
      </div>
    );
  }

  const dashboardContextValue = {
    dashboard,
    dashboardNotice,
    moderationNotice,
    refreshDashboard,
    loadingDashboard,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    toggleAutoRefresh,
    adminIdentity,
    adminRole,
    adminNow,
    adminWeather,
    lastRefreshedAt,
    pendingBookings,
    approvedBookings,
    pendingApprovalBookings,
    focusedBooking,
    pendingOrders,
    unreadMessagesCount,
    dueNowTotal,
    orderRevenueTotal,
    operationsDate,
    setOperationsDate,
    operationsChairCapacity,
    setOperationsChairCapacity,
    operationsStaffInput,
    setOperationsStaffInput,
    operationsDateBookings,
    operationsDateOrders,
    operationsDateMessages,
    operationsRevenue,
    operationsCompletionRate,
    operationsBookingApprovalRate,
    averageOrderValue,
    executiveHealthSignal,
    operationsStaffOptions,
    operationsAssignmentValidation,
    slotLoadSummary,
    customerPulse,
    canViewModerationAudit,
    moderationActivityCount,
    loadingModerationAudit,
    moderationAuditLogs,
    overduePendingCount,
    viewMode,
    setViewMode,
    bookingSearch,
    setBookingSearch,
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingDateFilter,
    setBookingDateFilter,
    orderSearch,
    setOrderSearch,
    orderStatusFilter,
    setOrderStatusFilter,
    orderDateFilter,
    setOrderDateFilter,
    messageSearch,
    setMessageSearch,
    messageTypeFilter,
    setMessageTypeFilter,
    messageStatusFilter,
    setMessageStatusFilter,
    filteredMessages,
    bookingsPage,
    setBookingsPage,
    ordersPage,
    setOrdersPage,
    newRequestsPage,
    setNewRequestsPage,
    newRequestsPageSize,
    setNewRequestsPageSize,
    bookingPages,
    orderPages,
    newRequestPages,
    bookingSlice,
    orderSlice,
    newRequestEntries,
    newRequestSlice,
    selectedBookingIds,
    setSelectedBookingIds,
    selectedOrderIds,
    setSelectedOrderIds,
    selectedBookingCount,
    selectedOrderCount,
    bookingActionBusyById,
    orderActionBusyById,
    focusedBookingId,
    setFocusedBookingId,
    bulkBookingStatus,
    setBulkBookingStatus,
    bulkOrderStatus,
    setBulkOrderStatus,
    applyBulkBookingStatus,
    applyBulkOrderStatus,
    saveBooking,
    saveOrder,
    saveFees,
    savingFees,
    feeForm,
    setFeeForm,
    productForm,
    setProductForm,
    productImagePreview,
    setProductImagePreview,
    handleAddProduct,
    renderBookingReplyComposer,
    renderOrderContactActions,
    renderOrderReplyComposer,
    renderMessageReplyComposer,
    toggleSelection,
    normalizeStatus,
    getOrderStatusLabel,
    bookingAssignments,
    assignmentNotifyBusyByBookingId,
    recentlyApprovedBookingIds,
    updateBookingAssignment,
    notifyBookingAssignment,
    todayDateKey,
    formatRelativeTime,
    exportBookingsCsv,
    exportOrdersCsv,
    focusPendingBookings,
    focusPendingOrders,
    focusUnreadMessages,
    focusProductsManagement
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-brand-light/40 via-brand-dark/10 to-brand-deep/10 px-4 py-4 text-ink sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute -left-24 top-16 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-brand-light/35 blur-3xl" />
      {renderAnimatedAdminBackground()}

      <div className="relative z-10 mx-auto max-w-400">
        <AdminDashboardProvider value={dashboardContextValue}>
          <AdminLayout
            activeSection={activeSection}
            sections={ADMIN_SECTIONS}
            counts={sectionCounts}
            queueCount={pendingBookings.length + pendingOrders.length}
            adminName={adminIdentity?.name || "Admin"}
            adminRole={adminRole}
            adminNow={adminNow}
            adminWeather={adminWeather}
            loadingDashboard={loadingDashboard}
            onRefresh={refreshDashboard}
            autoRefreshEnabled={autoRefreshEnabled}
            onToggleAutoRefresh={toggleAutoRefresh}
            onSignOut={handleSignOut}
            lastRefreshedAt={lastRefreshedAt}
          >
            <div className="space-y-4">
              <Notice tone={dashboardNotice?.tone} message={dashboardNotice?.message} />
              <Notice tone={moderationNotice?.tone} message={moderationNotice?.message} />
              <Outlet />
            </div>
          </AdminLayout>
        </AdminDashboardProvider>
      </div>
    </div>
  );
}

