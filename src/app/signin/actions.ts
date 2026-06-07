"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { normalizeEmail } from "@/modules/auth/access";
import { evaluateSignIn } from "@/modules/auth/invites";

export type SignInState = { error?: string } | undefined;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Sends a magic-link sign-in email — but only to invited / bootstrap / existing
 * addresses. Either way the caller lands on the same "check your email" page, so
 * we never disclose who is on the team.
 */
export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  const { allowed } = await evaluateSignIn(email);
  if (allowed) {
    // Sends the link and throws a redirect to the verifyRequest page.
    await signIn("resend", { email, redirectTo: "/dashboard" });
  }

  redirect("/signin/check-email");
}
