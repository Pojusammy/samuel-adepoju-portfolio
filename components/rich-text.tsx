"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { accentLinks } from "@/data/site";

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

export function RichText({ paragraph }: { paragraph: string }) {
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
      {paragraph.split(linkPattern).reduce<React.ReactNode[]>((nodes, segment, index, parts) => {
        if (index % 3 === 0) {
          if (segment) nodes.push(<span key={`text-${index}`}>{segment}</span>);
          return nodes;
        }

        if (index % 3 === 1) {
          const href = parts[index + 1];
          const accent = accentLinks.find((item) => item.label === segment || item.href === href);

          nodes.push(
            <Link
              key={`link-${segment}-${index}`}
              href={href}
              className="underline decoration-current underline-offset-[0.18em] transition-opacity hover:opacity-80"
              style={{ color: theme === "dark" ? accent?.darkColor : accent?.color }}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
            >
              {segment}
            </Link>,
          );
          return nodes;
        }

        return nodes;
      }, [])}
    </>
  );
}
