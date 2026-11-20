/* Runtime configuration: Vite exposes only VITE_* values to the browser. */
const configuredApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "");

const allowedResourceExtensions = (
  import.meta.env.ALLOWED_RESOURCE_EXTENSIONS ||
  ".pdf,.doc,.docx,.txt,.zip"
)
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean);

export const env = {
  apiUrl: normalizedApiUrl.endsWith("/api")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api`,
  appTitle: import.meta.env.VITE_APP_TITLE || "School Portal",
  appVersion: import.meta.env.VITE_APP_VERSION || "v1.0",
  allowedResourceExtensions,
  maxResourceSizeMb: Number(import.meta.env.MAX_RESOURCE_SIZE_MB) || 50,
  maxResourceCount: Number(import.meta.env.MAX_RESOURCE_COUNT) || 10,
  defaultChildLabel:
    import.meta.env.DEFAULT_CHILD_LABEL || "Learner",
};
