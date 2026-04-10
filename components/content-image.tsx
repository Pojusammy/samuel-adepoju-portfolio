import Image from "next/image";

import { resolveMediaSrc } from "@/lib/utils";

type ContentImageProps = {
  src: string;
  alt: string;
  caption?: string;
};

export function ContentImage({ src, alt, caption }: ContentImageProps) {
  return (
    <figure className="my-10">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-line bg-background-soft shadow-soft">
        <div className="relative aspect-[16/10]">
          <Image
            src={resolveMediaSrc(src)}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 680px"
          />
        </div>
      </div>
      {caption ? <figcaption className="mt-3 text-sm leading-6 text-foreground-muted">{caption}</figcaption> : null}
    </figure>
  );
}
