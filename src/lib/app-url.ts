import { headers } from "next/headers";

/**
 * The canonical base URL (no trailing slash) for building absolute links in
 * server code. Prefers a configured URL so links are stable across
 * proxies/hosts; falls back to the incoming request host, so it must be called
 * within a request context when no URL is configured.
 */
export async function appBaseUrl(): Promise<string> {
  const configured = (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL
  )?.replace(/\/+$/, "");
  if (configured) return configured;

  const h = await headers();
  const host = h.get("host") ?? "";
  // Trust the proxy's proto in production; fall back to http only for local
  // hosts so the link points somewhere that actually resolves in dev.
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}
