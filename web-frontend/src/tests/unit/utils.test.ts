import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (classnames utility)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "excluded", "included")).toBe("base included");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles undefined gracefully", () => {
    expect(cn(undefined, "foo", undefined)).toBe("foo");
  });

  it("handles empty string", () => {
    expect(cn("", "foo")).toBe("foo");
  });
});
