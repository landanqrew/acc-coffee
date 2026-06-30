import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

const page = read("page.tsx");
const brewForm = read("brew-form.tsx");
const reportForm = read("report-form.tsx");

describe("Service detail re-skin", () => {
  it("keeps the record on a full page, not a sheet/modal", () => {
    // The edit-model decision keeps this child record a full page.
    expect(page).toMatch(/<section[^>]*mx-auto[^>]*max-w-/);
    expect(page).not.toContain("SheetContent");
  });

  it("builds the read views from the Card primitive", () => {
    expect(page).toMatch(/from "@\/components\/ui"/);
    expect(page).toContain("Card");
  });

  it("drops the legacy neutral-bordered list grammar", () => {
    // The old read views were hand-rolled neutral-200 dl/ul borders; the
    // re-skin replaces them with Cards on theme tokens.
    expect(page).not.toContain("border-neutral-200");
    expect(page).not.toContain("divide-neutral-200");
    expect(page).not.toContain("bg-green-50");
  });

  it("renders pot counts, stock counts and feedback averages in mono", () => {
    // Every numeric on the page lines up in JetBrains Mono with tabular-nums:
    // the shared ReadRow (brew / report answers / counts) and the feedback
    // stat cards both opt in.
    const monoHits = page.match(/font-mono tabular-nums/g) ?? [];
    expect(monoHits.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the feedback average out of five", () => {
    expect(page).toContain("/ 5");
    expect(page).toContain("toFixed(1)");
  });
});

describe("Brew form re-skin", () => {
  it("uses the Field and Button primitives", () => {
    expect(brewForm).toMatch(/from "@\/components\/ui"/);
    expect(brewForm).toContain("Field");
    expect(brewForm).toContain("Button");
  });

  it("enters pot counts in mono", () => {
    expect(brewForm).toContain("mono");
  });

  it("preserves the form contract the action depends on", () => {
    // Filing/saving must work unchanged: same field names, same hidden id.
    expect(brewForm).toContain('name="serviceId"');
    expect(brewForm).toContain('name="mediumPots"');
    expect(brewForm).toContain('name="darkPots"');
  });
});

describe("Report form re-skin", () => {
  it("uses the Field and Button primitives", () => {
    expect(reportForm).toMatch(/from "@\/components\/ui"/);
    expect(reportForm).toContain("Field");
    expect(reportForm).toContain("Button");
  });

  it("enters the per-Supply stock counts in mono", () => {
    expect(reportForm).toContain("mono");
  });

  it("preserves the form contract the action depends on", () => {
    // fileReportAction reads count_<supplyId> and each question id verbatim.
    expect(reportForm).toContain('name="serviceId"');
    expect(reportForm).toContain("count_");
  });
});
