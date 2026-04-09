"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import type { SocialLink } from "@/lib/types";

export function PageHeader({ links }: { links: SocialLink[] }) {
  const reduceMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 8);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  if (reduceMotion) {
    return (
      <div className="sticky top-0 z-20 mx-auto w-[calc(100%-32px)] max-w-[712px] pt-1">
        <div
          className={`flex items-center rounded-[60px] px-4 py-4 ${
            isScrolled ? "bg-background/72 backdrop-blur-md" : "bg-transparent"
          }`}
        >
          <div className="flex-1">
            <Link href="/" className="relative block size-6">
              <Image
                src="/images/figma/mark.svg"
                alt="Samuel Adepoju mark"
                fill
                className="site-mark object-contain"
                sizes="24px"
              />
            </Link>
          </div>
          <div className="flex items-center gap-6 text-[14px] leading-5 text-foreground-muted">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-foreground"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="sticky top-0 z-20 mx-auto w-[calc(100%-32px)] max-w-[712px] pt-1"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.045,
            delayChildren: 0.06,
          },
        },
      }}
    >
      <div
        className={`flex items-center rounded-[60px] px-4 py-4 transition-[background-color,backdrop-filter] duration-200 ${
          isScrolled ? "bg-background/72 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <motion.div
          className="flex-1"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="relative block size-6">
            <Image
              src="/images/figma/mark.svg"
              alt="Samuel Adepoju mark"
              fill
              className="site-mark object-contain"
              sizes="24px"
            />
          </Link>
        </motion.div>

        <div className="flex items-center gap-6 text-[14px] leading-5 text-foreground-muted">
          {links.map((link) => (
            <motion.div
              key={link.label}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={link.href}
                className="hover:text-foreground"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
