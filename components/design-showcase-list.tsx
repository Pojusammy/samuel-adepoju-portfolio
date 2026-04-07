"use client";

"use client";

import Image from "next/image";
import type { ShowcaseItem } from "@/lib/types";

export function DesignShowcaseList({ items }: { items: ShowcaseItem[] }) {
  return (
    <div className="space-y-12">
      {items.map((item) => (
        <article key={item.slug} className="pb-12">
          {(() => {
            const media = item.media ?? (item.image ? { type: "image" as const, ...item.image } : undefined);

            return (
          <div
            className="relative h-[425px] w-full overflow-hidden rounded-[14px]"
            style={{ backgroundColor: item.panelColor }}
          >
            {media?.type === "video" ? (
              <video
                src={media.src}
                poster={media.poster}
                aria-label={media.alt}
                className="h-full w-full object-cover"
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
                className="object-cover"
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
          </div>
            );
          })()}
          <div className="mt-3 space-y-1">
            <h3 className="text-[15px] font-medium leading-[22px] text-foreground/80">
              {item.title}
            </h3>
            <p className="text-[14px] leading-6 text-foreground/52">{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
