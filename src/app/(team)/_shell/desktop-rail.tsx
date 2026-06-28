"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActiveHref, railDestinations } from "./nav";

/**
 * Desktop hover-expand rail (`md:` and up). Collapsed it shows just icons;
 * on hover it widens to reveal the full, role-gated destination list and the
 * signed-in member. Mirrors the mobile bar's destinations so navigation is
 * identical across breakpoints.
 */
export function DesktopRail({
  lead,
  userEmail,
  signOutAction,
}: {
  lead: boolean;
  userEmail: string | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const destinations = railDestinations(lead);

  const label =
    "ml-3 truncate opacity-0 transition-opacity duration-200 group-hover:opacity-100";

  return (
    <aside
      aria-label="Sidebar"
      className="group sticky top-0 hidden h-svh w-16 flex-none flex-col overflow-hidden border-r border-border bg-white py-4 transition-[width] duration-200 hover:w-60 md:flex"
    >
      <div className="flex items-center px-3 pb-4">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
          AC
        </span>
        <span className={cn(label, "text-sm font-bold text-foreground")}>
          acc-coffee
        </span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3">
        {destinations.map((d) => {
          const Icon = d.icon;
          const active = isActiveHref(pathname, d.href);
          return (
            <Link
              key={d.key}
              href={d.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center rounded-xl py-2.5 pl-2.5 text-sm font-medium",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 flex-none" />
              <span className={label}>{d.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-2 border-t border-border px-3 pt-3">
        {userEmail && (
          <p className={cn(label, "ml-0 mb-2 text-xs text-muted-foreground")}>
            {userEmail}
          </p>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center rounded-xl py-2.5 pl-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5 flex-none" />
            <span className={label}>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
