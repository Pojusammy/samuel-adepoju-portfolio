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
      className="relative inline-flex h-6 w-10 items-center rounded-full border border-line bg-background-soft p-0.5"
      onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="sr-only">{mounted ? theme : "dark"}</span>
      <span
        aria-hidden="true"
        className="block size-4 rounded-full bg-foreground transition-transform duration-200 ease-[var(--ease-premium)]"
        style={{ transform: theme === "dark" ? "translateX(16px)" : "translateX(0px)" }}
      />
    </button>
  );
}
