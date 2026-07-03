"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox === undefined
    ) {
      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("Service Worker registered successfully with scope:", registration.scope);
        } catch (error) {
          console.error("Service Worker registration failed:", error);
        }
      };

      // Register service worker after window load to avoid blocking initial assets load
      if (document.readyState === "complete") {
        handleRegister();
      } else {
        window.addEventListener("load", handleRegister);
        return () => window.removeEventListener("load", handleRegister);
      }
    }
  }, []);

  return null;
}
