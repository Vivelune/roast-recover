import { describe, it, expect } from "vitest";

// Test the reorder logic without DB
function calcAvgInterval(dates: Date[]): number {
  if (dates.length < 2) return 0;
  const intervals: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i].getTime() - dates[i - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff > 1) intervals.push(diff);
  }
  if (intervals.length === 0) return 0;
  return Math.round(
    intervals.reduce((a, b) => a + b, 0) / intervals.length
  );
}

describe("Reorder intelligence", () => {
  it("calculates average interval correctly", () => {
    const now = new Date();
    const dates = [
      new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      now,
    ];
    const avg = calcAvgInterval(dates);
    expect(avg).toBe(30);
  });

  it("ignores same-day orders", () => {
    const now = new Date();
    const dates = [
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 1000), // 1 second later
      now,
    ];
    const avg = calcAvgInterval(dates);
    expect(avg).toBe(30); // only counts the 30-day gap
  });

  it("returns 0 for single order", () => {
    const avg = calcAvgInterval([new Date()]);
    expect(avg).toBe(0);
  });

  it("identifies low stock correctly", () => {
    const isLow = (daysSince: number, avgInterval: number) =>
      avgInterval - daysSince <= 7;

    expect(isLow(25, 28)).toBe(true);  // 3 days left
    expect(isLow(10, 28)).toBe(false); // 18 days left
    expect(isLow(22, 28)).toBe(true);  // 6 days left
  });
});

describe("Price calculations", () => {
  it("calculates deposit correctly", () => {
    const calc = (priceCents: number, pct: number) =>
      Math.round((priceCents * pct) / 100);

    expect(calc(500000, 30)).toBe(150000); // $5000 * 30% = $1500
    expect(calc(249900, 30)).toBe(74970);  // $2499 * 30% = $749.70
  });

  it("calculates balance correctly", () => {
    const balance = (price: number, deposit: number) => price - deposit;
    expect(balance(500000, 150000)).toBe(350000);
  });

  it("formats USD correctly", () => {
    const format = (cents: number) => `$${(cents / 100).toFixed(2)}`;
    expect(format(150000)).toBe("$1500.00");
    expect(format(74970)).toBe("$749.70");
    expect(format(0)).toBe("$0.00");
  });
});

describe("Invoice numbering", () => {
  it("pads invoice numbers correctly", () => {
    const fmt = (n: number) =>
      `RR-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;

    expect(fmt(1)).toMatch(/RR-\d{4}-0001/);
    expect(fmt(42)).toMatch(/RR-\d{4}-0042/);
    expect(fmt(1000)).toMatch(/RR-\d{4}-1000/);
  });
});