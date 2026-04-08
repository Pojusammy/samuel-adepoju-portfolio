"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ShowcaseItem } from "@/lib/types";

export function DesignShowcaseList({ items }: { items: ShowcaseItem[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="space-y-12"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }
      }
    >
      {items.map((item, index) => (
        <motion.article
          key={item.slug}
          className="pb-12"
          variants={
            reduceMotion
              ? undefined
              : {
                  hidden: { opacity: 0, y: 20, scale: 0.992 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.78, delay: index * 0.01, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {(() => {
            const media = item.media ?? (item.image ? { type: "image" as const, ...item.image } : undefined);

            return (
              <motion.div
                className="group relative aspect-[1.58] w-full overflow-hidden rounded-[14px] sm:h-[425px] sm:aspect-auto"
                style={{ backgroundColor: item.panelColor }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="absolute inset-0"
                  whileHover={reduceMotion ? undefined : { scale: 1.018 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  {media?.type === "video" ? (
                    <video
                      src={media.src}
                      poster={media.poster}
                      aria-label={media.alt}
                      className="h-full w-full object-cover object-center"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : media?.type === "image" ? (
                    <Image
                      src={media.src}
                      alt={media.alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 680px"
                    />
                  ) : (
                    <>
                      {Array.from({ length: 15 }).map((_, index) => (
                        <div
                          key={`h-${index}`}
                          className="absolute left-0 right-0 h-px bg-white/[0.03]"
                          style={{ top: `${(index + 1) * 28}px` }}
                        />
                      ))}
                      {Array.from({ length: 24 }).map((_, index) => (
                        <div
                          key={`v-${index}`}
                          className="absolute bottom-0 top-0 w-px bg-white/[0.03]"
                          style={{ left: `${(index + 1) * 28}px` }}
                        />
                      ))}
                      <p className="absolute bottom-5 left-5 text-[10px] font-medium tracking-[0.12em] text-white/[0.18]">
                        {item.panelLabel}
                      </p>
                    </>
                  )}
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/[0.03] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.div>
            );
          })()}
          <motion.div
            className="mt-3 space-y-1"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="text-[15px] font-medium leading-[22px] text-foreground/80 transition-transform duration-300 group-hover:translate-x-[1px]">
              {item.title}
            </h3>
            <p className="text-[14px] leading-6 text-foreground/52">{item.description}</p>
          </motion.div>
        </motion.article>
      ))}
    </motion.div>
  );
}
