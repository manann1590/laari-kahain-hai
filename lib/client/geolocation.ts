const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 30000,
};

function geolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return [
      "Location permission is blocked for this site or browser.",
      "On iPhone, check Settings > Privacy & Security > Location Services, then enable location for Safari Websites or your browser app and reload this page.",
      "If you are opening a local http:// address, use the HTTPS deployment because iOS blocks location on insecure pages.",
    ].join(" ");
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your current location is unavailable. Turn on Location Services, disable Low Power Mode if needed, and try again outdoors.";
  }

  if (error.code === error.TIMEOUT) {
    return "Location lookup timed out. Try again from an open area or enter the coordinates manually.";
  }

  return error.message || "Could not access current location.";
}

async function geolocationPermissionMessage() {
  if (!("permissions" in navigator) || !navigator.permissions.query) return "";

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    if (permission.state === "denied") {
      return [
        "Location permission is blocked for this site.",
        "On iPhone, enable location for Safari Websites or your browser app in Settings, then reload this page and allow access when prompted.",
      ].join(" ");
    }
  } catch {
    return "";
  }

  return "";
}

export async function getCurrentCoordinates() {
  if (!navigator.geolocation) {
    throw new Error("This browser does not support location access.");
  }

  if (!window.isSecureContext) {
    throw new Error("Location requires HTTPS on iPhone and most mobile browsers. Open the deployed HTTPS site, not a local http:// address.");
  }

  const permissionMessage = await geolocationPermissionMessage();
  if (permissionMessage) throw new Error(permissionMessage);

  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => reject(new Error(geolocationErrorMessage(error))),
      GEOLOCATION_OPTIONS,
    );
  });
}
