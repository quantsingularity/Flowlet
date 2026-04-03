import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Performance monitoring with better error handling
if (import.meta.env.PROD) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log("Navigation timing:", {
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

// Global error handling with improved logging
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

// Security: Remove console in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Initialize app
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
