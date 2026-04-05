"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { accentLinks } from "@/data/site";
import type { SummaryParagraph } from "@/lib/types";

export function RichText({ paragraph }: { paragraph: SummaryParagraph }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");

    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {paragraph.map((segment, index) =>
        segment.type === "text" ? (
          <span key={`${segment.type}-${index}`}>{segment.value}</span>
        ) : (
          (() => {
            const accent = accentLinks.find((item) => item.label === segment.label);

            return (
              <Link
                key={`${segment.type}-${segment.label}-${index}`}
                href={segment.href}
                className="underline decoration-current underline-offset-[0.18em] transition-opacity hover:opacity-80"
                style={{ color: theme === "dark" ? accent?.darkColor : accent?.color }}
                target={segment.href.startsWith("http") ? "_blank" : undefined}
                rel={segment.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {segment.label}
              </Link>
            );
          })()
        ),
      )}
    </>
  );
}
