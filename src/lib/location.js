import { apiGet } from "@/lib/api";

export function buildGoogleMapsLink(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
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

  try {
    const data = await apiGet(
      `/api/location/reverse-geocode?latitude=${encodeURIComponent(String(latitude))}&longitude=${encodeURIComponent(String(longitude))}`
    );
    const address = String(data?.formattedAddress || data?.address || "").trim();
    const mapLink = String(data?.mapLink || fallbackMapLink).trim();

    return {
      latitude,
      longitude,
      mapLink,
      address: address || `Current location (Google Maps: ${mapLink || fallbackMapLink})`
    };
  } catch {
    return {
      latitude,
      longitude,
      mapLink: fallbackMapLink,
      address: `Current location (Google Maps: ${fallbackMapLink})`
    };
  }
}
