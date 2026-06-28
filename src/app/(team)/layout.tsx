import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { signOutAction } from "./actions";
import { DesktopRail } from "./_shell/desktop-rail";
import { MobileNav } from "./_shell/mobile-nav";

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();
  const lead = isLead(user.role);

  return (
    <div className="flex min-h-svh bg-app">
      <DesktopRail
        lead={lead}
        userEmail={user.email}
        signOutAction={signOutAction}
      />
      {/* Bottom padding clears the fixed mobile tab bar; it's not present at md+. */}
      <main className="min-w-0 flex-1 p-4 pb-28 md:p-6 md:pb-6">{children}</main>
      <MobileNav
        lead={lead}
        userEmail={user.email}
        signOutAction={signOutAction}
      />
    </div>
  );
}
