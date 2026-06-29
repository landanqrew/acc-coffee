import { headers } from "next/headers";

/** Strips a trailing slash and ensures a scheme on a bare host (e.g. Vercel's). */
function normalizeBase(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * The canonical base URL (no trailing slash) for building absolute links in
 * server code. Resolution order:
 *
 *   1. An explicitly configured canonical URL (NEXT_PUBLIC_APP_URL / AUTH_URL).
 *   2. Vercel's canonical production domain, exposed automatically by the
 *      platform — so links are correct in prod without extra configuration.
 *   3. The incoming request Host — a dev convenience only.
 *
 * Pass `trusted: true` for URLs embedded in email (e.g. an invite's sign-in
 * link). That refuses step 3 for non-local hosts: an attacker-controlled Host
 * header must never become a link we email to a victim (host-header injection /
 * phishing). It throws instead, so a misconfigured deploy fails loudly rather
 * than sending a poisoned link.
 */
export async function appBaseUrl(opts?: { trusted?: boolean }): Promise<string> {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) return normalizeBase(configured);

  const h = await headers();
  const host = h.get("host") ?? "";
  // Trust the proxy's proto in production; fall back to http only for local
  // hosts so the link points somewhere that actually resolves in dev.
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  if (opts?.trusted && !isLocal) {
    throw new Error(
      "Cannot build a trusted app URL from an untrusted request host. " +
        "Set NEXT_PUBLIC_APP_URL or AUTH_URL to the app's canonical URL.",
    );
  }
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}
