import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import {
  useDebounce,
  useLocalStorage,
  useOnlineStatus,
  useResponsive,
} from "@/hooks";
import uiReducer from "@/store/uiSlice";

// Create a store wrapper for hooks that need Redux
const createTestStore = () => configureStore({ reducer: { ui: uiReducer } });

const StoreWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Provider store={createTestStore()}>{children}</Provider>;

describe("useOnlineStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  it("returns initial online status", () => {
    const { result } = renderHook(() => useOnlineStatus(), {
      wrapper: StoreWrapper,
    });
    expect(result.current).toBe(true);
  });

  it("updates status when going offline", () => {
    const { result } = renderHook(() => useOnlineStatus(), {
      wrapper: StoreWrapper,
    });

    act(() => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: false,
      });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toBe(false);
  });

  it("updates status when coming back online", () => {
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus(), {
      wrapper: StoreWrapper,
    });

    act(() => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: true,
      });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toBe(true);
  });
});

describe("useResponsive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct responsive states for mobile", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it("returns correct responsive states for tablet", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 800,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("returns correct responsive states for desktop", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });
});

describe("useLocalStorage", () => {
  it("returns initial value when key not set", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("stores and retrieves value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key-2", ""));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
  });

  it("accepts updater function", () => {
    const { result } = renderHook(() => useLocalStorage("test-counter", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });
});

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("debounces value updates", async () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
    vi.useRealTimers();
  });
});
