import { headers } from "next/headers";
import QRCode from "qrcode";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/dal";
import { PrintButton } from "./print-button";

// The survey URL is derived from the request host, so render per-request.
export const dynamic = "force-dynamic";

export default async function FeedbackQrPage() {
  await requireSession();

  // Prefer a configured canonical base URL so the printed QR is stable across
  // proxies/hosts; fall back to the request host when none is set.
  const configuredBase = (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL
  )?.replace(/\/+$/, "");
  let surveyUrl: string;
  if (configuredBase) {
    surveyUrl = `${configuredBase}/survey`;
  } else {
    const h = await headers();
    const host = h.get("host") ?? "";
    // Trust the proxy's proto in production; fall back to http only for local
    // hosts so the printed QR points somewhere that actually resolves in dev.
    const isLocal = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
    const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    surveyUrl = `${proto}://${host}/survey`;
  }

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
          <p className="text-sm text-muted-foreground">
            Print this and set it out where coffee is served. Scanning it opens
            the anonymous survey — no account needed.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Lifted card on screen; keep a hairline frame when printed, where the
          shadow drops out, so the QR still reads as a bordered handout. */}
      <Card className="space-y-4 p-6 text-center print:border print:border-border print:shadow-none">
        <p className="text-lg font-medium">How was the coffee?</p>
        <div
          className="mx-auto w-56"
          role="img"
          aria-label="QR code — scan to open the feedback survey"
          // Trusted, server-generated SVG from the qrcode library.
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="break-all font-mono text-sm text-muted-foreground">
          {surveyUrl}
        </p>
      </Card>
    </section>
  );
}
