"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { ThemeToggle } from "@/components/theme-toggle";
import type { SocialLink } from "@/lib/types";

export function PageHeader({ links }: { links: SocialLink[] }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="flex items-center py-5 sm:py-8">
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
    );
  }

  return (
    <motion.div
      className="flex items-center py-5 sm:py-8"
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
    </motion.div>
  );
}
