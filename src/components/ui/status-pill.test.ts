import { describe, expect, it } from "vitest";
import { statusPillVariants } from "./status-pill";

describe("statusPillVariants", () => {
  it("uses the ok token trio (fg + bg + bd)", () => {
    const cls = statusPillVariants({ status: "ok" });
    expect(cls).toContain("text-ok");
    expect(cls).toContain("bg-ok-bg");
    expect(cls).toContain("border-ok-bd");
  });

  it("uses the warn token trio", () => {
    const cls = statusPillVariants({ status: "warn" });
    expect(cls).toContain("text-warn");
    expect(cls).toContain("bg-warn-bg");
    expect(cls).toContain("border-warn-bd");
  });

  it("uses the danger token trio", () => {
    const cls = statusPillVariants({ status: "danger" });
    expect(cls).toContain("text-danger");
    expect(cls).toContain("bg-danger-bg");
    expect(cls).toContain("border-danger-bd");
  });
});
