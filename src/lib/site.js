const moneyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

export function formatCurrency(value) {
  return moneyFormatter.format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function getErrorMessage(error) {
  const payload = error && typeof error === "object" ? error.payload : null;
  const payloadCode = payload && typeof payload === "object" ? String(payload.code || "").trim().toUpperCase() : "";
  const payloadError = payload && typeof payload === "object" ? String(payload.error || "").trim() : "";
  const otpEmailReason = payload && payload.delivery && payload.delivery.email
    ? String(payload.delivery.email.reason || "").trim()
    : "";
  const rawMessage = error instanceof Error && error.message ? String(error.message) : "";
  const normalizedMessage = rawMessage.toLowerCase();

  if (payloadError.toLowerCase().includes("failed to deliver otp")) {
    if (otpEmailReason) {
      return `Failed to send admin OTP email: ${otpEmailReason}`;
    }
    return payloadError;
  }

  if (
    payloadCode === "EMAIL_NOT_CONFIGURED" ||
    payloadCode === "BREVO_NOT_CONFIGURED" ||
    payloadCode === "EMAIL_FROM_INVALID"
  ) {
    return "Email sending is not configured on the backend yet. Configure Brevo (BREVO_API_KEY, BREVO_BASE_URL, EMAIL_FROM), then restart/redeploy the backend.";
  }

  if (
    normalizedMessage.includes("api key") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("invalid login") ||
    normalizedMessage.includes("bad credentials") ||
    normalizedMessage.includes("authentication failed")
  ) {
    return "Brevo rejected the backend email credentials. Re-check BREVO_API_KEY and your Brevo sender settings, then restart/redeploy the backend.";
  }

  if (
    normalizedMessage.includes("etimedout") ||
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("econnection")
  ) {
    return "Brevo email delivery timed out. Check BREVO_BASE_URL, your hosting network access, and try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
