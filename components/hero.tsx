"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

import { RichText } from "@/components/rich-text";
import { heroContent, heroSummary } from "@/data/site";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [isSecondParagraphExpanded, setIsSecondParagraphExpanded] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.3"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0.2, 0.7, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.994, 1]);

  return (
    <section id="hero" ref={ref} className="relative pt-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.06,
              delayChildren: 0.14,
            },
          },
        }}
        className="max-w-[42.5rem]"
        style={
          reduceMotion
            ? undefined
            : {
                opacity,
                y,
                scale,
                willChange: "transform, opacity",
              }
        }
      >
        <motion.div
          className="relative size-[50px] overflow-hidden rounded-xl sm:size-[100px]"
          variants={{
            hidden: { opacity: 0, y: 14, scale: 0.97 },
            visible: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/images/figma/avatar.jpg"
            alt="Samuel Adepoju portrait"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 50px, 100px"
          />
        </motion.div>
        <motion.h1
          className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground"
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroContent.title}
        </motion.h1>
        <motion.p
          className="mt-4 text-[15.5px] leading-[26px] text-foreground-muted"
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroContent.subtitle}
        </motion.p>
      </motion.div>

      <motion.div
        className="mt-9 space-y-5 text-[16px] leading-[30px] text-foreground-soft"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.26,
            },
          },
        }}
      >
        {heroSummary.map((paragraph, index) => (
          <motion.p
            key={index}
            className={`max-w-[42.5rem] ${index > 1 && !isSecondParagraphExpanded ? "hidden sm:block" : ""}`}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          >
            {index === 1 ? (
              <>
                <span className="hidden sm:inline">
                  <RichText paragraph={paragraph} />
                </span>
                <span className="sm:hidden">
                  <span
                    className="block overflow-hidden"
                    style={
                      isSecondParagraphExpanded
                        ? undefined
                        : {
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 3,
                          }
                    }
                  >
                    <RichText paragraph={paragraph} />
                  </span>
                  {!isSecondParagraphExpanded ? (
                    <button
                      type="button"
                      onClick={() => setIsSecondParagraphExpanded(true)}
                      className="mt-2 inline-flex text-[13px] font-medium tracking-[-0.01em] text-foreground transition-colors hover:text-foreground-soft"
                    >
                      <span
                        className="inline-block pb-px"
                        style={{ borderBottom: "1px solid var(--read-more-underline)" }}
                      >
                        Read more
                      </span>
                    </button>
                  ) : null}
                </span>
              </>
            ) : (
              <RichText paragraph={paragraph} />
            )}
          </motion.p>
        ))}
      </motion.div>
    </section>
  );
}
