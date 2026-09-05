import { describe, expect, it } from "vitest";
import { slugify, isValidHexColor, isValidUrl, formatRelativeDays } from "./utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Acme Robotics")).toBe("acme-robotics");
  });

  it("strips punctuation", () => {
    expect(slugify("Bob's Bakery & Co.")).toBe("bobs-bakery-co");
  });

  it("collapses repeated whitespace and hyphens", () => {
    expect(slugify("  Northwind   Labs -- Inc  ")).toBe("northwind-labs-inc");
  });

  it("returns an empty string for input with no keepable characters", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("isValidHexColor", () => {
  it("accepts 6-digit and 3-digit hex colors", () => {
    expect(isValidHexColor("#14213D")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(true);
  });

  it("rejects non-hex values", () => {
    expect(isValidHexColor("navy")).toBe(false);
    expect(isValidHexColor("14213D")).toBe(false);
    expect(isValidHexColor("#12")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("treats an empty string as valid (optional field)", () => {
    expect(isValidUrl("")).toBe(true);
  });

  it("accepts well-formed URLs", () => {
    expect(isValidUrl("https://example.com/logo.png")).toBe(true);
  });

  it("rejects malformed URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });
});

describe("formatRelativeDays", () => {
  it("reports today for the current date", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(formatRelativeDays(today)).toBe("Posted today");
  });

  it("reports a singular day correctly", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(formatRelativeDays(yesterday)).toBe("Posted 1 day ago");
  });

  it("reports plural days correctly", () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(formatRelativeDays(fiveDaysAgo)).toBe("Posted 5 days ago");
  });
});
