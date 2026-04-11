import { describe, it, expect } from "vitest";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const sendMoneySchema = z.object({
  recipient: z.string().min(1),
  amount: z.coerce.number().min(0.01).max(10000),
  currency: z.string().min(1),
});

describe("Login schema validation", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "demo@flowlet.com",
      password: "demo123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "demo123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "demo@flowlet.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("SendMoney schema validation (amount coercion)", () => {
  it("coerces string amount to number", () => {
    const result = sendMoneySchema.safeParse({
      recipient: "user@test.com",
      amount: "100.50",
      currency: "USD",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(100.5);
  });

  it("rejects zero amount", () => {
    const result = sendMoneySchema.safeParse({
      recipient: "user@test.com",
      amount: 0,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amount over 10000", () => {
    const result = sendMoneySchema.safeParse({
      recipient: "user@test.com",
      amount: 10001,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty recipient", () => {
    const result = sendMoneySchema.safeParse({
      recipient: "",
      amount: 100,
      currency: "USD",
    });
    expect(result.success).toBe(false);
  });
});
