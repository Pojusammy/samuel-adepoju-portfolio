export type SocialLink = {
  label: string;
  href: string;
};

export type AccentLink = SocialLink & {
  color: string;
  darkColor: string;
};

export type InlineSegment =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "link";
      label: string;
      href: string;
    };

export type SummaryParagraph = InlineSegment[];

export type ShowcaseItem = {
  slug: string;
  title: string;
  description: string;
  href?: string;
  panelLabel: string;
  panelColor: string;
  panelTone?: "light" | "dark";
  image?: {
    src: string;
    alt: string;
  };
};

export type ProjectFrontmatter = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  thumbnailAlt: string;
  coverImage?: string;
  coverAlt?: string;
  liveUrl?: string;
  role?: string;
};

export type ProjectPageData = ProjectFrontmatter & {
  content: ReactNode;
};
import type { ReactNode } from "react";
