"use client";

import { useEffect, useSyncExternalStore } from "react";

export function Metrics({ id, path, record }: { id: string; path: string; record: boolean }) {
  useEffect(() => {
    if (record) {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        keepalive: true,
      }).catch(() => undefined);
    }
    const params = new URLSearchParams(location.search);
    if (!/^G-[A-Z0-9]+$/.test(id) || ["invite", "preview", "t"].some((key) => params.has(key))) return;
    try {
      if (localStorage.getItem("writing-room-analytics") !== "yes") return;
    } catch {
      return;
    }
    const global = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    global.dataLayer ??= [];
    global.gtag = function (...args: unknown[]) {
      global.dataLayer?.push(args);
    };
    global.gtag("js", new Date());
    global.gtag("config", id, { page_location: location.origin + location.pathname, allow_google_signals: false });
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [id, path, record]);
  return null;
}

const analyticsListeners = new Set<() => void>();
function subscribeAnalytics(callback: () => void) {
  analyticsListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    analyticsListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
function readAnalyticsSnapshot() {
  try {
    return localStorage.getItem("writing-room-analytics") === "yes";
  } catch {
    return false;
  }
}

export function PrivacyPreference() {
  const allowed = useSyncExternalStore(subscribeAnalytics, readAnalyticsSnapshot, () => false);
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={allowed}
        onChange={(event) => {
          try {
            localStorage.setItem("writing-room-analytics", event.target.checked ? "yes" : "no");
          } catch {
            // ignore storage restrictions
          }
          analyticsListeners.forEach((cb) => cb());
        }}
      />
      Allow optional Google Analytics on this browser
    </label>
  );
}
