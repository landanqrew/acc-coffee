import { describe, expect, it } from "vitest";
import {
  PRIMARY_TABS,
  isActiveHref,
  moreSheetItems,
  railDestinations,
} from "./nav";

describe("nav model", () => {
  it("exposes exactly the three primary mobile tabs in order", () => {
    expect(PRIMARY_TABS.map((d) => d.href)).toEqual([
      "/services",
      "/stock",
      "/runbook",
    ]);
  });

  it("never surfaces the retired /dashboard route", () => {
    const everywhere = [
      ...PRIMARY_TABS,
      ...railDestinations(true),
      ...moreSheetItems(true),
    ];
    expect(everywhere.some((d) => d.href === "/dashboard")).toBe(false);
  });

  describe("More sheet", () => {
    it("gives a Volunteer only Feedback (no lead-only items)", () => {
      expect(moreSheetItems(false).map((d) => d.href)).toEqual(["/feedback"]);
    });

    it("gives a Lead Feedback plus Supplies, Team and Settings", () => {
      const hrefs = moreSheetItems(true).map((d) => d.href);
      expect(hrefs).toContain("/feedback");
      expect(hrefs).toContain("/supplies");
      expect(hrefs).toContain("/team");
      expect(hrefs).toContain("/settings");
    });

    it("excludes the primary tabs from the More sheet", () => {
      const hrefs = moreSheetItems(true).map((d) => d.href);
      expect(hrefs).not.toContain("/services");
      expect(hrefs).not.toContain("/stock");
      expect(hrefs).not.toContain("/runbook");
    });
  });

  describe("desktop rail", () => {
    it("shows the full destination list to a Lead", () => {
      const hrefs = railDestinations(true).map((d) => d.href);
      expect(hrefs).toEqual([
        "/services",
        "/stock",
        "/runbook",
        "/feedback",
        "/supplies",
        "/team",
        "/settings",
      ]);
    });

    it("hides lead-only destinations from a Volunteer", () => {
      const hrefs = railDestinations(false).map((d) => d.href);
      expect(hrefs).toEqual(["/services", "/stock", "/runbook", "/feedback"]);
    });
  });

  describe("isActiveHref", () => {
    it("matches the exact path", () => {
      expect(isActiveHref("/services", "/services")).toBe(true);
    });

    it("matches a child path so a tab stays lit on detail pages", () => {
      expect(isActiveHref("/services/abc123", "/services")).toBe(true);
    });

    it("does not match an unrelated sibling that shares a prefix", () => {
      expect(isActiveHref("/services-archive", "/services")).toBe(false);
      expect(isActiveHref("/stock", "/services")).toBe(false);
    });
  });
});
