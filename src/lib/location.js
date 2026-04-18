import { apiGet } from "@/lib/api";

export function buildGoogleMapsLink(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
}

function formatCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(6) : "";
}

function buildCoordinateAddress(latitude, longitude) {
  const lat = formatCoordinate(latitude);
  const lon = formatCoordinate(longitude);

  return lat && lon ? `Current location: ${lat}, ${lon}` : "Current location detected";
}

function cleanResolvedAddress(value) {
  return String(value || "")
    .replace(/\s*\(Google Maps:\s*https?:\/\/[^)]+\)\s*$/i, "")
    .replace(/\s*Google Maps:\s*https?:\/\/\S+\s*$/i, "")
    .trim();
}

async function reverseGeocodeInBrowser(latitude, longitude) {
  const query = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1"
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    credentials: "omit"
  });

  if (!response.ok) {
    throw new Error(`Address lookup failed (${response.status})`);
  }

  const payload = await response.json();
  return cleanResolvedAddress(payload?.display_name || payload?.name);
}

function getBrowserPosition() {
  if (typeof window === "undefined" || !window.navigator || !window.navigator.geolocation) {
    const error = new Error("Location is not available on this device/browser.");
    error.code = "GEOLOCATION_UNAVAILABLE";
    throw error;
  }

  return new Promise((resolve, reject) => {
    window.navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 60000
    });
  });
}

export function getCurrentLocationErrorMessage(error) {
  const code = error && error.code;

  if (code === 1 || code === "PERMISSION_DENIED") {
    return "Location permission was blocked. Allow location access in your browser, then try again.";
  }

  if (code === 2 || code === "POSITION_UNAVAILABLE") {
    return "Your device could not provide a current location. Please type the address manually.";
  }

  if (code === 3 || code === "TIMEOUT") {
    return "Location detection timed out. Please try again or type the address manually.";
  }

  return error && error.message
    ? String(error.message)
    : "Could not detect your current location. Please type the address manually.";
}

export async function resolveCurrentLocationAddress() {
  const position = await getBrowserPosition();
  const latitude = Number(position && position.coords ? position.coords.latitude : NaN);
  const longitude = Number(position && position.coords ? position.coords.longitude : NaN);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid location coordinates returned by this device.");
  }

  const fallbackMapLink = buildGoogleMapsLink(latitude, longitude);
  let address = "";
  let mapLink = fallbackMapLink;

  try {
    const data = await apiGet(
      `/api/location/reverse-geocode?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}`
    );
    address = cleanResolvedAddress(data?.address || data?.formattedAddress);
    mapLink = String(data?.mapLink || fallbackMapLink).trim();
  } catch {
    // If the app API is not reachable, try a browser-side lookup before falling back to coordinates.
  }

  if (!address) {
    try {
      address = await reverseGeocodeInBrowser(latitude, longitude);
    } catch {
      address = "";
    }
  }

  return {
    latitude,
    longitude,
    mapLink,
    address: address || buildCoordinateAddress(latitude, longitude)
  };
}
