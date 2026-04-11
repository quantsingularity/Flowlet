import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Performance monitoring
if (import.meta.env.PROD) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          console.info("Navigation timing:", {
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            domContentLoaded:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            firstPaint: navEntry.responseEnd - navEntry.requestStart,
          });
        }
      }
    });
    observer.observe({ entryTypes: ["navigation"] });
  } catch (error) {
    console.warn("Performance monitoring not available:", error);
  }
}

// Global error handling
window.addEventListener("error", (event) => {
  const errorInfo = {
    message: event.error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  console.error("Global error:", errorInfo);
});

window.addEventListener("unhandledrejection", (event) => {
  const errorInfo = {
    reason: event.reason,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  console.error("Unhandled promise rejection:", errorInfo);
});

// In production suppress only log/warn/info, never error
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  // console.error intentionally kept for error reporting
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
