import { describe, expect, it } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateId,
  validateEmail,
  validatePassword,
  sanitizeInput,
  maskSensitiveData,
  encodeBase64,
  decodeBase64,
  isTokenExpired,
  parseJWT,
  formatFileSize,
  generateSecureRandom,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
  });
});

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats EUR correctly", () => {
    const result = formatCurrency(1000, "EUR");
    expect(result).toContain("1,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("validateEmail", () => {
  it("accepts valid email", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("user+tag@sub.domain.com")).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(validateEmail("notanemail")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts strong password", () => {
    const result = validatePassword("SecurePass1!");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects short password", () => {
    const result = validatePassword("Abc1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long",
    );
  });

  it("rejects password without uppercase", () => {
    const result = validatePassword("lowercase1!");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one uppercase letter",
    );
  });

  it("rejects password without special character", () => {
    const result = validatePassword("NoSpecial123");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must contain at least one special character",
    );
  });
});

describe("sanitizeInput", () => {
  it("removes HTML angle brackets", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).not.toContain("<");
  });

  it("removes javascript: protocol", () => {
    expect(sanitizeInput("javascript:alert(1)")).not.toContain("javascript:");
  });

  it("trims whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });
});

describe("maskSensitiveData", () => {
  it("masks all but last 4 chars", () => {
    expect(maskSensitiveData("1234567890")).toBe("******7890");
  });

  it("masks entirely when shorter than visibleChars", () => {
    expect(maskSensitiveData("abc")).toBe("***");
  });

  it("respects custom visibleChars", () => {
    expect(maskSensitiveData("1234567890", 6)).toBe("****567890");
  });
});

describe("encodeBase64 / decodeBase64", () => {
  it("round-trips ASCII string", () => {
    const original = "Hello, World!";
    expect(decodeBase64(encodeBase64(original))).toBe(original);
  });

  it("round-trips unicode string", () => {
    const original = "Héllo Wörld! 🎉";
    expect(decodeBase64(encodeBase64(original))).toBe(original);
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("maskSensitiveData edge cases", () => {
  it("handles empty string", () => {
    expect(maskSensitiveData("")).toBe("");
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
    expect(formatFileSize(512)).toBe("512 Bytes");
  });

  it("formats KB", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats MB", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
  });
});

describe("generateSecureRandom", () => {
  it("generates string of correct length", () => {
    expect(generateSecureRandom(16).length).toBe(16);
    expect(generateSecureRandom(32).length).toBe(32);
  });

  it("contains only alphanumeric chars", () => {
    const result = generateSecureRandom(64);
    expect(/^[A-Za-z0-9]+$/.test(result)).toBe(true);
  });
});

describe("parseJWT", () => {
  it("parses valid JWT payload", () => {
    const payload = { sub: "user-1", exp: 9999999999 };
    const encoded = btoa(JSON.stringify(payload));
    const token = `header.${encoded}.signature`;

    const result = parseJWT(token);
    expect(result?.sub).toBe("user-1");
  });

  it("returns null for malformed token", () => {
    expect(parseJWT("not-a-token")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("returns true for expired token", () => {
    const payload = { exp: Math.floor(Date.now() / 1000) - 60 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    expect(isTokenExpired(token)).toBe(true);
  });

  it("returns false for valid token", () => {
    const payload = { exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    expect(isTokenExpired(token)).toBe(false);
  });

  it("returns true for missing exp claim", () => {
    const payload = { sub: "user-1" };
    const token = `h.${btoa(JSON.stringify(payload))}.s`;
    expect(isTokenExpired(token)).toBe(true);
  });
});
