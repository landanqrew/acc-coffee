import { afterEach, describe, expect, it } from "vitest";
import { requireEnv } from "./env";

const NAME = "ACC_COFFEE_TEST_VAR";

afterEach(() => {
  delete process.env[NAME];
});

describe("requireEnv", () => {
  it("returns the value when the variable is set", () => {
    process.env[NAME] = "beans";
    expect(requireEnv(NAME)).toBe("beans");
  });

  it("throws when the variable is missing", () => {
    expect(() => requireEnv(NAME)).toThrow(NAME);
  });

  it("throws when the variable is empty", () => {
    process.env[NAME] = "";
    expect(() => requireEnv(NAME)).toThrow(NAME);
  });
});
