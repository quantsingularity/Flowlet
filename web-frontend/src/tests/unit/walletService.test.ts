import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWalletData } from "@/services/walletService";

describe("fetchWalletData", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.5); // never triggers error branch
  });

  it("resolves with quickStats and recentTransactions", async () => {
    const data = await fetchWalletData();
    expect(data).toHaveProperty("quickStats");
    expect(data).toHaveProperty("recentTransactions");
  });

  it("quickStats contains 4 entries", async () => {
    const { quickStats } = await fetchWalletData();
    expect(quickStats).toHaveLength(4);
  });

  it("each quickStat has required shape", async () => {
    const { quickStats } = await fetchWalletData();
    for (const stat of quickStats) {
      expect(stat).toHaveProperty("title");
      expect(stat).toHaveProperty("value");
      expect(stat).toHaveProperty("change");
      expect(["up", "down"]).toContain(stat.trend);
    }
  });

  it("recentTransactions are non-empty", async () => {
    const { recentTransactions } = await fetchWalletData();
    expect(recentTransactions.length).toBeGreaterThan(0);
  });

  it("each transaction has required fields", async () => {
    const { recentTransactions } = await fetchWalletData();
    for (const tx of recentTransactions) {
      expect(typeof tx.id).toBe("number");
      expect(typeof tx.description).toBe("string");
      expect(typeof tx.amount).toBe("number");
      expect(typeof tx.date).toBe("string");
    }
  });

  it("rejects on random failure", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0); // triggers error branch
    await expect(fetchWalletData()).rejects.toThrow();
  });
});
