import { describe, it, expect } from "vitest";

describe("Slug generation", () => {
  function makeSlug(title: string): string {
    return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")    // Remove special characters
    .trim()
    .replace(/\s+/g, "-")            // Replace spaces with hyphens
    .slice(0, 80);
  }

  it("converts spaces to hyphens", () => {
    expect(makeSlug("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(makeSlug("Café & Coffee!")).toBe("cafe-coffee");
  });

  it("truncates long titles", () => {
    const long = "a".repeat(100);
    expect(makeSlug(long)).toHaveLength(80);
  });

  it("lowercases everything", () => {
    expect(makeSlug("ESPRESSO MACHINE")).toBe("espresso-machine");
  });
});

describe("Referral code generation", () => {
  function generateCode(name: string): string {
    const base = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
    const suffix = Math.floor(Math.random() * 90 + 10);
    return `${base}${suffix}`;
  }

  it("generates uppercase codes", () => {
    const code = generateCode("Marcus");
    expect(code).toMatch(/^[A-Z]+\d{2}$/);
  });

  it("handles names with spaces", () => {
    const code = generateCode("Marcus Chen");
    expect(code).toMatch(/^[A-Z]+\d{2}$/);
  });

  it("generates codes of reasonable length", () => {
    const code = generateCode("John");
    expect(code.length).toBeGreaterThanOrEqual(3);
    expect(code.length).toBeLessThanOrEqual(8);
  });
});

describe("Email validation", () => {
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  it("accepts valid emails", () => {
    expect(isValidEmail("test@café.com")).toBe(true);
    expect(isValidEmail("owner@elevencoffee.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("notanemail")).toBe(false);
    expect(isValidEmail("missing@")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
  });
});