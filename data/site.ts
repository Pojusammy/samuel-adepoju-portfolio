import site from "@/data/site.json";
import type { AccentLink, ContactContent, HeroContent, SiteContent, SiteMeta, SocialLink } from "@/lib/types";

const content = site as SiteContent;

export const siteMeta: SiteMeta = content.siteMeta;
export const heroContent: HeroContent = content.hero;
export const contactContent: ContactContent = content.contact;
export const socialLinks: SocialLink[] = content.socialLinks;
export const topBarLinks: SocialLink[] = content.topBarLinks;
export const accentLinks: AccentLink[] = content.accentLinks;
export const heroSummary = content.heroSummary;
