import { describe, it, expect, vi } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatNumber,
  truncate,
  getInitials,
  slugify,
  debounce,
  generateId,
  clamp,
  omit,
  pick,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => expect(cn("a", "b")).toBe("a b"));
  it("deduplicates tailwind classes", () =>
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500"));
  it("handles falsy values", () =>
    expect(cn("a", false && "b", undefined, "c")).toBe("a c"));
});

describe("formatCurrency", () => {
  it("formats USD by default", () =>
    expect(formatCurrency(1234.5)).toBe("$1,234.50"));
  it("formats EUR", () =>
    expect(formatCurrency(99.9, "EUR")).toContain("99.90"));
  it("handles zero", () => expect(formatCurrency(0)).toBe("$0.00"));
  it("handles negative", () => expect(formatCurrency(-50)).toContain("50.00"));
});

describe("formatDate", () => {
  it("returns 'Today' for today", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(formatDate(today)).toBe("Today");
  });
  it("returns 'Yesterday' for yesterday", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    expect(formatDate(d.toISOString().slice(0, 10))).toBe("Yesterday");
  });
});

describe("formatNumber", () => {
  it("formats millions", () => expect(formatNumber(1_500_000)).toBe("1.5M"));
  it("formats thousands", () => expect(formatNumber(2500)).toBe("2.5K"));
  it("returns raw for small numbers", () =>
    expect(formatNumber(42)).toBe("42"));
  it("handles negative thousands", () =>
    expect(formatNumber(-1500)).toBe("-1.5K"));
});

describe("truncate", () => {
  it("does not truncate short strings", () =>
    expect(truncate("hello", 10)).toBe("hello"));
  it("truncates long strings with ellipsis", () =>
    expect(truncate("hello world!", 8)).toBe("hello..."));
});

describe("getInitials", () => {
  it("returns first two initials uppercase", () =>
    expect(getInitials("John Doe")).toBe("JD"));
  it("handles single name", () => expect(getInitials("Alice")).toBe("AL"));
});

describe("slugify", () => {
  it("lowercases and hyphenates", () =>
    expect(slugify("Hello World")).toBe("hello-world"));
  it("removes special chars", () => expect(slugify("foo@bar!")).toBe("foobar"));
});

describe("debounce", () => {
  it("delays function call", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () =>
    expect(generateId().length).toBeGreaterThan(0));
  it("generates unique ids", () => expect(generateId()).not.toBe(generateId()));
});

describe("clamp", () => {
  it("clamps below min", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("clamps above max", () => expect(clamp(15, 0, 10)).toBe(10));
  it("passes through in range", () => expect(clamp(5, 0, 10)).toBe(5));
});

describe("omit", () => {
  it("removes specified keys", () => {
    const result = omit({ a: 1, b: 2, c: 3 } as Record<string, unknown>, ["b"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });
});

describe("pick", () => {
  it("picks specified keys", () => {
    const result = pick({ a: 1, b: 2, c: 3 } as Record<string, unknown>, [
      "a",
      "c",
    ]);
    expect(result).toEqual({ a: 1, c: 3 });
  });
});
