import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isLead, type Role } from "@/modules/auth/roles";

export type CurrentUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: Role;
};

/**
 * The signed-in team member, or null. Memoized per render pass so layouts and
 * pages can each call it without extra session lookups.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role,
  };
});

/** Requires an authenticated team member; redirects to sign-in otherwise. */
export async function requireSession(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

/** Requires a Lead; sends Volunteers back to the dashboard. */
export async function requireLead(): Promise<CurrentUser> {
  const user = await requireSession();
  if (!isLead(user.role)) redirect("/dashboard");
  return user;
}
