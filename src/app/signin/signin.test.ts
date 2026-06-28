import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(resolve(__dirname, file), "utf8");

const page = read("page.tsx");
const form = read("signin-form.tsx");
const checkEmail = read("check-email/page.tsx");

describe("sign-in re-skin", () => {
  it("dresses the magic-link form in the shared primitives", () => {
    expect(form).toMatch(/from "@\/components\/ui"/);
    expect(form).toContain("Button");
    expect(form).toContain("Field");
  });

  it("drops the old neutral grammar from every public/auth screen", () => {
    for (const src of [page, form, checkEmail]) {
      expect(src).not.toContain("bg-neutral-900");
      expect(src).not.toContain("border-neutral-300");
      expect(src).not.toContain("text-neutral-500");
      expect(src).not.toContain("text-neutral-400");
    }
  });

  it("speaks the royal-blue token vocabulary instead", () => {
    expect(page).toContain("text-muted-foreground");
    expect(checkEmail).toContain("text-muted-foreground");
  });

  it("renders errors with the danger token, not raw red", () => {
    expect(form).toContain("text-danger");
    expect(form).not.toContain("text-red-600");
  });
});
