"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { RichText } from "@/components/rich-text";
import { heroSummary } from "@/data/site";

export function Hero() {
  return (
    <section id="hero" className="relative pt-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[42.5rem]"
      >
        <div className="relative size-[50px] overflow-hidden rounded-xl sm:size-[100px]">
          <Image
            src="/images/figma/avatar.png"
            alt="Samuel Adepoju portrait"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 50px, 100px"
          />
        </div>
        <h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground">
          Samuel Adepoju
        </h1>
        <p className="mt-4 text-[15.5px] leading-[26px] text-foreground-muted">
          Designing clarity in complex systems
        </p>
      </motion.div>

      <div className="mt-9 space-y-5 text-[16px] leading-[30px] text-foreground-soft">
        {heroSummary.map((paragraph, index) => (
          <p key={index} className="max-w-[42.5rem]">
            <RichText paragraph={paragraph} />
          </p>
        ))}
      </div>
    </section>
  );
}
