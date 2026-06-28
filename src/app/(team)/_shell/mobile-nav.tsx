"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui";
import { PRIMARY_TABS, isActiveHref, moreSheetItems } from "./nav";

/**
 * Mobile bottom tab bar (thumb reach, safe-area inset) — Services · Stock ·
 * Runbook · More. The fourth slot opens a bottom sheet whose contents are
 * role-gated: a Volunteer sees Feedback + Sign out; a Lead also sees Supplies,
 * Team and Settings. Hidden from `md:` up, where the desktop rail takes over.
 */
export function MobileNav({
  lead,
  userEmail,
  signOutAction,
}: {
  lead: boolean;
  userEmail: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const moreItems = moreSheetItems(lead);
  const moreActive = moreItems.some((d) => isActiveHref(pathname, d.href));

  const slot =
    "flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-1 text-[10px] font-medium";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-white px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {PRIMARY_TABS.map((d) => {
        const Icon = d.icon;
        const active = isActiveHref(pathname, d.href);
        return (
          <Link
            key={d.key}
            href={d.href}
            aria-current={active ? "page" : undefined}
            className={cn(slot, active ? "text-accent-foreground" : "text-muted-foreground")}
          >
            <span className={cn("grid h-9 w-9 place-items-center rounded-xl", active && "bg-accent")}>
              <Icon className="h-5 w-5" />
            </span>
            {d.label}
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger
          className={cn(slot, moreActive ? "text-accent-foreground" : "text-muted-foreground")}
        >
          <span className={cn("grid h-9 w-9 place-items-center rounded-xl", moreActive && "bg-accent")}>
            <Ellipsis className="h-5 w-5" />
          </span>
          More
        </SheetTrigger>
        <SheetContent title="More">
          {userEmail && (
            <p className="mt-1 text-xs text-muted-foreground">{userEmail}</p>
          )}
          <ul className="mt-3 space-y-1">
            {moreItems.map((d) => {
              const Icon = d.icon;
              const active = isActiveHref(pathname, d.href);
              return (
                <li key={d.key}>
                  <SheetClose asChild>
                    <Link
                      href={d.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-5 w-5 flex-none" />
                      {d.label}
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
          <form action={signOutAction} className="mt-3 border-t border-border pt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-5 w-5 flex-none" />
              Sign out
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
