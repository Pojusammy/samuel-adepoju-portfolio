export type SocialLink = {
  label: string;
  href: string;
};

export type SiteMeta = {
  title: string;
  description: string;
  url: string;
};

export type AccentLink = SocialLink & {
  color: string;
  darkColor: string;
};

export type HeroContent = {
  title: string;
  subtitle: string;
};

export type ContactContent = {
  intro: string;
};

export type SiteContent = {
  siteMeta: SiteMeta;
  hero: HeroContent;
  contact: ContactContent;
  socialLinks: SocialLink[];
  topBarLinks: SocialLink[];
  accentLinks: AccentLink[];
  heroSummary: string[];
};

export type ShowcaseItem = {
  slug: string;
  title: string;
  description: string;
  href?: string;
  panelLabel: string;
  panelColor: string;
  panelTone?: "light" | "dark";
  media?: {
    type: "image" | "video";
    src: string;
    alt: string;
    poster?: string;
  };
  image?: {
    src: string;
    alt: string;
  };
};

export type ProjectContentBlock =
  | {
      id: string;
      type: "section";
      title: string;
      body: string;
    }
  | {
      id: string;
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      id: string;
      type: "video";
      src: string;
      alt: string;
      caption?: string;
      poster?: string;
    }
  | {
      id: string;
      type: "callout";
      title: string;
      body: string;
    };

export type EditableProject = {
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
  body: string;
  blocks?: ProjectContentBlock[];
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
