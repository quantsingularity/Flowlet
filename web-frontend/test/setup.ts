import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

// Mock localStorage using a proper Map to avoid key/method name conflicts
const localStorageStore = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => localStorageStore.get(key) ?? null,
  setItem: (key: string, value: string) => localStorageStore.set(key, value),
  removeItem: (key: string) => localStorageStore.delete(key),
  clear: () => localStorageStore.clear(),
  get length() {
    return localStorageStore.size;
  },
  key: (index: number) => Array.from(localStorageStore.keys())[index] ?? null,
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage similarly
const sessionStorageStore = new Map<string, string>();
const sessionStorageMock = {
  getItem: (key: string) => sessionStorageStore.get(key) ?? null,
  setItem: (key: string, value: string) => sessionStorageStore.set(key, value),
  removeItem: (key: string) => sessionStorageStore.delete(key),
  clear: () => sessionStorageStore.clear(),
  get length() {
    return sessionStorageStore.size;
  },
  key: (index: number) => Array.from(sessionStorageStore.keys())[index] ?? null,
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    headers: new Headers(),
  } as Response),
);

// Mock crypto.randomUUID for generateId
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => "00000000-0000-0000-0000-000000000000",
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++)
          arr[i] = Math.floor(Math.random() * 256);
        return arr;
      },
    },
  });
}

// Reset mocks between tests
beforeEach(() => {
  localStorageStore.clear();
  sessionStorageStore.clear();
});
