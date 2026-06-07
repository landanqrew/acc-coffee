import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

/** Sends a plain-text email via Resend. Throws if the provider rejects the send. */
export async function sendEmail({ to, subject, text }: EmailMessage): Promise<void> {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from: requireEnv("EMAIL_FROM"),
    to,
    subject,
    text,
  });
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/** Emails a passwordless sign-in (magic) link to a team member. */
export async function sendMagicLink(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Your acc-coffee sign-in link",
    text:
      `Tap the link below to sign in to acc-coffee:\n\n${url}\n\n` +
      "This link signs you in and expires shortly. " +
      "If you didn't request it, you can safely ignore this email.",
  });
}
