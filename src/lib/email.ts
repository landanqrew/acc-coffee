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
