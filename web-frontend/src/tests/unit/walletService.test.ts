import { describe, it, expect } from "vitest";
import { walletService } from "@/lib/api/walletService";

describe("walletService", () => {
  it("exports getAccounts function", () => {
    expect(typeof walletService.getAccounts).toBe("function");
  });
  it("exports getCards function", () => {
    expect(typeof walletService.getCards).toBe("function");
  });
  it("exports depositFunds function", () => {
    expect(typeof walletService.depositFunds).toBe("function");
  });
});
