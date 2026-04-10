import { resolveMediaSrc } from "@/lib/utils";

type ContentVideoProps = {
  src: string;
  title?: string;
  caption?: string;
  poster?: string;
};

export function ContentVideo({ src, title, caption, poster }: ContentVideoProps) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-[1.6rem] border border-line bg-background-soft shadow-soft">
        <video
          src={resolveMediaSrc(src)}
          poster={resolveMediaSrc(poster)}
          title={title}
          className="block aspect-[16/10] w-full object-cover"
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm leading-6 text-foreground-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
