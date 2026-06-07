import { describe, expect, it } from "vitest";
import { decideSignIn, normalizeEmail, resolveInitialRole } from "./access";

const BOOTSTRAP = "first.lead@church.org";

describe("normalizeEmail", () => {
  it("lowercases and trims so addresses compare consistently", () => {
    expect(normalizeEmail("  Pat@Church.ORG ")).toBe("pat@church.org");
  });
});

describe("decideSignIn", () => {
  it("denies an uninvited email with no invite, account, or bootstrap match", () => {
    expect(
      decideSignIn({ email: "stranger@example.com", invite: null, isExistingUser: false }),
    ).toEqual({ allowed: false });
  });

  it("admits an invited Volunteer with the invited role", () => {
    expect(
      decideSignIn({
        email: "newvol@church.org",
        invite: { email: "newvol@church.org", role: "volunteer" },
        isExistingUser: false,
      }),
    ).toEqual({ allowed: true, role: "volunteer" });
  });

  it("admits an invited Lead with the invited role", () => {
    expect(
      decideSignIn({
        email: "newlead@church.org",
        invite: { email: "newlead@church.org", role: "lead" },
        isExistingUser: false,
      }),
    ).toEqual({ allowed: true, role: "lead" });
  });

  it("bootstraps the configured first Lead with no invite", () => {
    expect(
      decideSignIn({
        email: BOOTSTRAP,
        invite: null,
        isExistingUser: false,
        bootstrapEmail: BOOTSTRAP,
      }),
    ).toEqual({ allowed: true, role: "lead" });
  });

  it("matches the bootstrap email case-insensitively and ignoring whitespace", () => {
    expect(
      decideSignIn({
        email: "  First.Lead@Church.org ",
        invite: null,
        isExistingUser: false,
        bootstrapEmail: BOOTSTRAP,
      }),
    ).toEqual({ allowed: true, role: "lead" });
  });

  it("admits an existing team member even without an outstanding invite", () => {
    expect(
      decideSignIn({ email: "veteran@church.org", invite: null, isExistingUser: true }),
    ).toEqual({ allowed: true });
  });
});

describe("resolveInitialRole", () => {
  it("assigns the invited role to a brand-new user", () => {
    expect(
      resolveInitialRole({
        email: "newlead@church.org",
        invite: { email: "newlead@church.org", role: "lead" },
      }),
    ).toBe("lead");
  });

  it("assigns Lead to the bootstrap email, overriding any weaker default", () => {
    expect(
      resolveInitialRole({ email: BOOTSTRAP, invite: null, bootstrapEmail: BOOTSTRAP }),
    ).toBe("lead");
  });

  it("falls back to Volunteer when there is neither invite nor bootstrap match", () => {
    expect(resolveInitialRole({ email: "someone@church.org", invite: null })).toBe("volunteer");
  });
});
