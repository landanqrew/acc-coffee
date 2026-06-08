import { headers } from "next/headers";
import QRCode from "qrcode";
import { requireSession } from "@/lib/dal";
import { PrintButton } from "./print-button";

// The survey URL is derived from the request host, so render per-request.
export const dynamic = "force-dynamic";

export default async function FeedbackQrPage() {
  await requireSession();

  const h = await headers();
  const host = h.get("host") ?? "";
  // Trust the proxy's proto in production; fall back to http only for local hosts
  // so the printed QR points somewhere that actually resolves in dev.
  const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  const surveyUrl = `${proto}://${host}/survey`;

  // Server-rendered SVG QR — no client JS, prints crisply at any size.
  const qrSvg = await QRCode.toString(surveyUrl, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Feedback Survey</h1>
          <p className="text-sm text-neutral-500">
            Print this and set it out where coffee is served. Scanning it opens
            the anonymous survey — no account needed.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 p-6 text-center">
        <p className="text-lg font-medium">How was the coffee?</p>
        <div
          className="mx-auto w-56"
          // Trusted, server-generated SVG from the qrcode library.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="break-all text-sm text-neutral-600">{surveyUrl}</p>
      </div>
    </section>
  );
}
