import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useOnlineStatus } from "@/hooks/useResponsive";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "first" } },
    );
    expect(result.current).toBe("first");
    rerender({ value: "second" });
    expect(result.current).toBe("first");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("second");
  });

  it("only applies last value within debounce window", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } },
    );
    rerender({ value: "b" });
    rerender({ value: "c" });
    rerender({ value: "d" });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("d");
  });
});

describe("useOnlineStatus", () => {
  it("returns true when online", () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("updates when offline event fires", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
  });

  it("updates when online event fires", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
