import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useResponsive,
  useOnlineStatus,
  useLocalStorage,
} from "@/hooks/useResponsive";

const setWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
  window.dispatchEvent(new Event("resize"));
};

describe("useResponsive", () => {
  it("identifies mobile when width < 768", () => {
    setWidth(375);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it("identifies desktop when width >= 1024", () => {
    setWidth(1280);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
  });

  it("identifies tablet when 768 <= width < 1024", () => {
    setWidth(900);
    const { result } = renderHook(() => useResponsive());
    expect(result.current.isTablet).toBe(true);
  });
});

describe("useOnlineStatus", () => {
  it("starts as online", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("becomes offline on offline event", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});

describe("useLocalStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns initial value when key is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("persists value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", ""));
    act(() => {
      result.current[1]("hello");
    });
    expect(result.current[0]).toBe("hello");
    expect(JSON.parse(localStorage.getItem("test-key")!)).toBe("hello");
  });

  it("reads existing localStorage value on init", () => {
    localStorage.setItem("pre-key", JSON.stringify(42));
    const { result } = renderHook(() => useLocalStorage("pre-key", 0));
    expect(result.current[0]).toBe(42);
  });
});
