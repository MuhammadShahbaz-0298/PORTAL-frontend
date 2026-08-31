/* Runtime configuration: Vite exposes only VITE_* values to the browser. */
const configuredApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");

export const env = {
  apiUrl: normalizedApiUrl.endsWith("/api")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api`,
  appTitle: import.meta.env.VITE_APP_TITLE || "School Portal",
  appLogo:
    import.meta.env.VITE_APP_LOGO ||
    "/manus-storage/portal-mark.png",
};
