import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling
window.addEventListener("error", (event) => {
  console.error("Unhandled error:", {
    message: event.error?.message || event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", {
    reason: event.reason,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });
});

// Performance monitoring (production only)
if (import.meta.env.PROD) {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "navigation") {
          const nav = entry as PerformanceNavigationTiming;
          console.info("Navigation timing:", {
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            domContentLoaded:
              nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          });
        }
      }
    });
    observer.observe({ entryTypes: ["navigation"] });
  } catch {
    // PerformanceObserver not available in this environment
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Root element not found. Ensure <div id='root'> exists in index.html.",
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
