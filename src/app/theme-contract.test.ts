import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) =>
  readFileSync(resolve(__dirname, file), "utf8");

const css = read("globals.css");
const layout = read("layout.tsx");

describe("globals.css token contract", () => {
  it("preserves the existing contract aliases", () => {
    for (const token of [
      "--color-background",
      "--color-foreground",
      "--font-sans",
      "--font-mono",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("maps the church royal-blue brand tokens", () => {
    const brand: [string, string][] = [
      ["--color-primary", "#2f6bff"],
      ["--color-primary-foreground", "#ffffff"],
      ["--color-accent", "#eef3ff"],
      ["--color-accent-foreground", "#1d4ed8"],
      ["--color-ring", "#2f6bff"],
    ];
    for (const [token] of brand) expect(css).toContain(token);
    for (const hex of ["#2f6bff", "#1d4ed8", "#eef3ff"]) {
      expect(css).toContain(hex);
    }
  });

  it("defines the surface palette", () => {
    for (const hex of [
      "#fbfcfd", // canvas
      "#eef1f4", // app
      "#f5f6f8", // muted
      "#5b6472", // muted-foreground
      "#9aa1ad", // subtle
      "#e6e8ec", // border / input
      "#111418", // foreground ink
    ]) {
      expect(css).toContain(hex);
    }
    for (const token of [
      "--color-canvas",
      "--color-app",
      "--color-muted",
      "--color-muted-foreground",
      "--color-subtle",
      "--color-border",
      "--color-input",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("defines the status fg/bg/bd trios", () => {
    for (const trio of [
      ["--color-ok", "--color-ok-bg", "--color-ok-bd"],
      ["--color-warn", "--color-warn-bg", "--color-warn-bd"],
      ["--color-danger", "--color-danger-bg", "--color-danger-bd"],
    ].flat()) {
      expect(css).toContain(trio);
    }
    for (const hex of [
      "#15803d",
      "#ecfdf3",
      "#a7f0c0",
      "#b54708",
      "#fffaeb",
      "#fedf89",
      "#b42318",
      "#fef3f2",
      "#fecdca",
    ]) {
      expect(css).toContain(hex);
    }
  });

  it("defines radii and shadow tokens", () => {
    for (const token of [
      "--radius-sm",
      "--radius-md",
      "--radius-lg",
      "--radius-xl",
      "--radius-2xl",
      "--shadow-soft",
      "--shadow-lift",
      "--shadow-panel",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("wires the fonts through the contract", () => {
    expect(css).toContain("--font-dm-sans");
    expect(css).toContain("--font-jetbrains-mono");
    expect(css).toMatch(/--font-mono:\s*var\(--font-jetbrains-mono\)/);
  });

  it("is light-only — no dark-mode block", () => {
    expect(css).not.toMatch(/prefers-color-scheme:\s*dark/);
  });
});

describe("layout font wiring", () => {
  it("loads DM Sans and JetBrains Mono via next/font/google", () => {
    expect(layout).toContain("DM_Sans");
    expect(layout).toContain("JetBrains_Mono");
  });

  it("exposes the font CSS variables", () => {
    expect(layout).toContain("--font-dm-sans");
    expect(layout).toContain("--font-jetbrains-mono");
  });
});
