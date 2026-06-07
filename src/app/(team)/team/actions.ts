"use server";

import { revalidatePath } from "next/cache";
import { requireLead } from "@/lib/dal";
import { createInvite, InviteError } from "@/modules/auth/invites";
import { isRole } from "@/modules/auth/roles";

export type InviteState = { error?: string; ok?: string } | undefined;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function inviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const lead = await requireLead();

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!isRole(role)) {
    return { error: "Choose a role." };
  }

  try {
    await createInvite({
      email,
      role,
      invitedByRole: lead.role,
      invitedByUserId: lead.id,
    });
  } catch (err) {
    if (err instanceof InviteError) {
      return { error: err.message };
    }
    console.error("Failed to create invite:", err);
    return { error: "Couldn't send the invite. Please try again." };
  }

  revalidatePath("/team");
  return { ok: `Invited ${email.toLowerCase()} as ${role}.` };
}
