import {
  BookOpen,
  Boxes,
  CalendarCheck,
  type LucideIcon,
  MessageSquare,
  Package,
  Settings,
  Users,
} from "lucide-react";

/**
 * The app-shell navigation model — the single source of truth the mobile tab
 * bar, the "More" sheet and the desktop rail all derive from. Kept as plain
 * data (no JSX) so the role-gating rules are unit-testable without rendering.
 */
export type NavDestination = {
  /** Stable key for React lists. */
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Lead-only destinations are absent for Volunteers. */
  leadOnly: boolean;
  /** Primary tabs occupy the mobile bottom bar; everything else lives in More. */
  primaryTab: boolean;
};

// Authored in desktop-rail order. Services is the post-login home (the retired
// /dashboard folds into it); the three primary tabs lead, then Feedback, then
// the Lead-only admin destinations.
const DESTINATIONS: readonly NavDestination[] = [
  { key: "services", href: "/services", label: "Services", icon: CalendarCheck, leadOnly: false, primaryTab: true },
  { key: "stock", href: "/stock", label: "Stock", icon: Boxes, leadOnly: false, primaryTab: true },
  { key: "runbook", href: "/runbook", label: "Runbook", icon: BookOpen, leadOnly: false, primaryTab: true },
  { key: "feedback", href: "/feedback", label: "Feedback", icon: MessageSquare, leadOnly: false, primaryTab: false },
  { key: "supplies", href: "/supplies", label: "Supplies", icon: Package, leadOnly: true, primaryTab: false },
  { key: "team", href: "/team", label: "Team", icon: Users, leadOnly: true, primaryTab: false },
  { key: "settings", href: "/settings", label: "Settings", icon: Settings, leadOnly: true, primaryTab: false },
];

/** The three always-visible mobile tabs (the fourth slot is "More"). */
export const PRIMARY_TABS: readonly NavDestination[] = DESTINATIONS.filter(
  (d) => d.primaryTab,
);

/** Destinations a given role may see — lead-only entries drop out for Volunteers. */
function visibleFor(lead: boolean): NavDestination[] {
  return DESTINATIONS.filter((d) => lead || !d.leadOnly);
}

/** Full destination list for the desktop hover-rail, role-gated. */
export function railDestinations(lead: boolean): NavDestination[] {
  return visibleFor(lead);
}

/**
 * Contents of the mobile "More" sheet: every role-visible destination that
 * isn't already a primary tab. A Volunteer's More is just Feedback; a Lead
 * also gets Supplies, Team and Settings. (Sign out is rendered separately.)
 */
export function moreSheetItems(lead: boolean): NavDestination[] {
  return visibleFor(lead).filter((d) => !d.primaryTab);
}

/**
 * Whether a nav destination should read as active for the current path. A
 * destination owns its own subtree (e.g. /services is active on a Service
 * detail page /services/123) but never matches an unrelated sibling.
 */
export function isActiveHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
