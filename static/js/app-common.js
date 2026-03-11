export async function loadConfig() {
  const res = await fetch("./config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load config.json");
  const cfg = await res.json();
  if (!cfg.API_URL) throw new Error("API_URL missing in config.json");
  return { API_URL: String(cfg.API_URL).replace(/\/+$/, "") };
}

export function buildApiUrl(apiBaseUrl, path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${apiBaseUrl}${path}`;
  return `${apiBaseUrl}/${path}`;
}

export async function fetchJson(apiBaseUrl, path, init) {
  const res = await fetch(buildApiUrl(apiBaseUrl, path), init);
  let payload = {};
  try {
    payload = await res.json();
  } catch (_) {
    payload = {};
  }
  if (!res.ok) {
    const msg = payload.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return payload;
}

export function apiAssetUrl(apiBaseUrl, rawPath) {
  if (!rawPath) return "";
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) return rawPath;
  if (rawPath.startsWith("/")) return `${apiBaseUrl}${rawPath}`;
  return `${apiBaseUrl}/${rawPath}`;
}

