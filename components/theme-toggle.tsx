"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "samuel-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const nextTheme =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  function updateTheme(nextTheme: "light" | "dark") {
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="relative inline-flex h-[26px] w-[44px] items-center rounded-full p-[1.5px] transition-colors duration-200 ease-[var(--ease-premium)]"
      style={{
        backgroundColor: theme === "dark" ? "#AB90EB" : "#C8C8C8",
        boxShadow:
          theme === "dark"
            ? "inset 0 0 0 1px rgba(171, 144, 235, 0.8)"
            : "inset 0 0 0 1px rgba(200, 200, 200, 0.92)",
      }}
      onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="sr-only">{mounted ? theme : "dark"}</span>
      <span
        aria-hidden="true"
        className="block size-[23px] rounded-full bg-white transition-transform duration-200 ease-[var(--ease-premium)]"
        style={{
          transform: theme === "dark" ? "translateX(17px)" : "translateX(0px)",
          boxShadow: "2px 9px 18px rgba(0, 0, 0, 0.14)",
        }}
      />
    </button>
  );
}
