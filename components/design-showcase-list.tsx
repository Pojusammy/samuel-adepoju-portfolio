"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { ShowcaseItem } from "@/lib/types";
import { resolveMediaSrc } from "@/lib/utils";

const showcaseTabs = [
  { key: "mobile-apps", label: "Mobile Apps" },
  { key: "websites", label: "Websites" },
  { key: "dashboards", label: "Dashboards" },
] as const;

type ShowcaseTabKey = (typeof showcaseTabs)[number]["key"];

export function DesignShowcaseList({ items }: { items: ShowcaseItem[] }) {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<ShowcaseTabKey>("mobile-apps");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [selectedImageSize, setSelectedImageSize] = useState<{ width: number; height: number } | null>(null);
  const hasMounted = useRef(false);
  const tabRefs = useRef<Record<ShowcaseTabKey, HTMLButtonElement | null>>({
    "mobile-apps": null,
    websites: null,
    dashboards: null,
  });

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const category = item.category ?? "mobile-apps";
        return category === activeTab;
      }),
    [activeTab, items],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    tabRefs.current[activeTab]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab, reduceMotion]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setIsDarkTheme(root.dataset.theme === "dark");

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      document.body.style.removeProperty("overflow");
      setSelectedImageSize(null);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.removeProperty("overflow");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const media =
      selectedItem.media ?? (selectedItem.image ? { type: "image" as const, ...selectedItem.image } : undefined);

    if (!media || media.type !== "image") {
      setSelectedImageSize(null);
      return;
    }

    const preloadImage = new window.Image();
    preloadImage.onload = () => {
      if (preloadImage.naturalWidth && preloadImage.naturalHeight) {
        setSelectedImageSize({
          width: preloadImage.naturalWidth,
          height: preloadImage.naturalHeight,
        });
      }
    };
    preloadImage.src = media.src;

    return () => {
      preloadImage.onload = null;
    };
  }, [selectedItem]);

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-2 sm:gap-2.5">
          {showcaseTabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <button
                key={tab.key}
                ref={(element) => {
                  tabRefs.current[tab.key] = element;
                }}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2.5 font-medium tracking-[-0.01em] transition-[color,border-color,background-color,box-shadow] duration-200 sm:px-5 ${
                  isActive
                    ? "text-foreground"
                    : "border border-transparent bg-transparent text-foreground-muted hover:text-foreground"
                }`}
                style={
                  isActive
                    ? isDarkTheme
                      ? {
                          lineHeight: "24px",
                          backgroundColor: "#09090B",
                          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
                        }
                      : {
                          lineHeight: "24px",
                          backgroundColor: "#FFFFFF",
                          boxShadow:
                            "inset 0 0 0 1px #E5E5E5, 0 1px 2px rgba(17, 17, 17, 0.04), 0 12px 24px -12px rgba(17, 17, 17, 0.14)",
                        }
                    : { lineHeight: "24px" }
                }
              >
                <span className="block text-[14px] sm:text-[15px]" style={{ lineHeight: "24px" }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={activeTab}
        className="space-y-12"
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
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
        {filteredItems.length ? (
          filteredItems.map((item, index) => (
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
                  <motion.button
                    type="button"
                    aria-label={`Open ${item.title} in full view`}
                    className="group relative block aspect-[1.58] w-full overflow-hidden rounded-[14px] sm:h-[425px] sm:aspect-auto"
                    style={{ backgroundColor: item.panelColor }}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <motion.div
                      className="absolute inset-0"
                      whileHover={reduceMotion ? undefined : { scale: 1.018 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {media?.type === "video" ? (
                        <video
                          src={resolveMediaSrc(media.src)}
                          poster={resolveMediaSrc(media.poster)}
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
                          src={resolveMediaSrc(media.src)}
                          alt={media.alt}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 768px) 100vw, 680px"
                        />
                      ) : (
                        <>
                          {Array.from({ length: 15 }).map((_, gridIndex) => (
                            <div
                              key={`h-${gridIndex}`}
                              className="absolute left-0 right-0 h-px bg-white/[0.03]"
                              style={{ top: `${(gridIndex + 1) * 28}px` }}
                            />
                          ))}
                          {Array.from({ length: 24 }).map((_, gridIndex) => (
                            <div
                              key={`v-${gridIndex}`}
                              className="absolute bottom-0 top-0 w-px bg-white/[0.03]"
                              style={{ left: `${(gridIndex + 1) * 28}px` }}
                            />
                          ))}
                          <p className="absolute bottom-5 left-5 text-[10px] font-medium tracking-[0.12em] text-white/[0.18]">
                            {item.panelLabel}
                          </p>
                        </>
                      )}
                    </motion.div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/[0.03] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                  </motion.button>
                );
              })()}
              <motion.div
                className="mt-3 space-y-1"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="text-[15px] font-medium leading-[22px] text-foreground/80 transition-transform duration-300 group-hover:translate-x-[1px]">
                  {item.title}
                </h3>
                <p className="text-[14px] leading-6 text-foreground/52">{item.description}</p>
              </motion.div>
            </motion.article>
          ))
        ) : (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[14px] border border-line bg-background-soft px-5 py-6 text-[14px] leading-6 text-foreground-muted"
          >
            More work in this category is coming soon.
          </motion.div>
        )}
      </motion.div>

      {isMounted
        ? createPortal(
            <AnimatePresence>
              {selectedItem ? (
                <motion.div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/78 p-5 backdrop-blur-sm sm:p-8"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={reduceMotion ? undefined : { opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setSelectedItem(null)}
                >
                  <motion.div
                    className="relative flex w-full max-w-[920px] items-center justify-center rounded-[22px] bg-background-soft p-0 shadow-soft"
                    initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.985 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.99 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {(() => {
                      const media =
                        selectedItem.media ??
                        (selectedItem.image ? { type: "image" as const, ...selectedItem.image } : undefined);

                      if (!media) {
                        return null;
                      }

                      if (media.type === "video") {
                        return (
                          <video
                            src={resolveMediaSrc(media.src)}
                            poster={resolveMediaSrc(media.poster)}
                            aria-label={media.alt}
                            className="max-h-[80vh] w-full rounded-[16px] bg-black object-contain"
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        );
                      }

                      return (
                        <div
                          className="flex w-full items-center justify-center overflow-hidden rounded-[16px]"
                          style={{ backgroundColor: selectedItem.panelColor || "#ffffff" }}
                        >
                          {selectedImageSize ? (
                            <Image
                              src={resolveMediaSrc(media.src)}
                              alt={media.alt}
                              width={selectedImageSize.width}
                              height={selectedImageSize.height}
                              className="h-auto max-h-[80vh] w-full object-contain"
                              sizes="(max-width: 960px) calc(100vw - 40px), 920px"
                              priority
                            />
                          ) : (
                            <div className="aspect-[1.58] w-full" />
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
