import Link from "next/link";

import { Callout } from "@/components/callout";
import { ContentImage } from "@/components/content-image";
import { ContentVideo } from "@/components/content-video";

export const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href ?? "#";
    const isExternal = href.startsWith("http");

    if (!isExternal) {
      return <Link href={href} className="site-link">{props.children}</Link>;
    }

    return (
      <a {...props} href={href} className="site-link" target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  },
  ContentImage,
  ContentVideo,
  Callout,
};
