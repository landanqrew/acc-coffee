import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

const page = read("page.tsx");
const form = read("survey-form.tsx");

describe("feedback survey re-skin", () => {
  it("uses the shared primitives for actions and inputs", () => {
    expect(form).toMatch(/from "@\/components\/ui"/);
    expect(form).toContain("Button");
  });

  it("drops the old neutral grammar", () => {
    for (const src of [page, form]) {
      expect(src).not.toContain("bg-neutral-900");
      expect(src).not.toContain("border-neutral-300");
      expect(src).not.toContain("text-neutral-500");
      expect(src).not.toContain("text-neutral-600");
    }
  });

  it("selects the rating scale with the brand fill, not ink-black", () => {
    expect(form).toContain("has-[:checked]:bg-primary");
    expect(form).not.toContain("has-[:checked]:bg-neutral-900");
  });

  it("confirms success with the ok status token, not raw green", () => {
    expect(form).toContain("text-ok");
    expect(form).not.toContain("text-green-800");
  });

  it("speaks the royal-blue token vocabulary", () => {
    expect(page).toContain("text-muted-foreground");
  });
});
