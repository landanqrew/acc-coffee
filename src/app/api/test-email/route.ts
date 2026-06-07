import { sendEmail } from "@/lib/email";
import { requireEnv } from "@/lib/env";

// Walking-skeleton route to verify the email provider end-to-end.
// Guarded by a shared secret; remove once real email flows (auth, alerts) exist.
export async function POST(request: Request) {
  const secret = request.headers.get("x-test-secret");
  if (!secret || secret !== requireEnv("TEST_EMAIL_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { to?: string };
  try {
    body = (await request.json()) as { to?: string };
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { to } = body;
  if (!to) {
    return Response.json({ error: "Missing 'to' address" }, { status: 400 });
  }

  await sendEmail({
    to,
    subject: "acc-coffee test email",
    text: "The acc-coffee email pipeline works.",
  });
  return Response.json({ sent: true });
}
