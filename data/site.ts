import type { AccentLink, SocialLink, SummaryParagraph } from "@/lib/types";

export const siteMeta = {
  title: "Samuel Adepoju",
  description:
    "A premium editorial portfolio for Samuel Adepoju, a product designer focused on clarity in complex systems.",
  url: "https://samueladepoju.com",
};

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/samueladepojutobi/" },
  { label: "X", href: "https://x.com/Pojusammy_" },
  { label: "Email", href: "mailto:adepojusamuel28@gmail.com" },
];

export const topBarLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/samueladepojutobi/" },
  { label: "X", href: "https://x.com/Pojusammy_" },
  { label: "Email", href: "mailto:adepojusamuel28@gmail.com" },
];

export const accentLinks: AccentLink[] = [
  {
    label: "Pangaea",
    href: "https://www.pangaea.holdings/",
    color: "#0354A6",
    darkColor: "#66A9FF",
  },
  {
    label: "Lumin Skin",
    href: "https://www.luminskin.com/",
    color: "#0D7A40",
    darkColor: "#43C37A",
  },
  {
    label: "Meridian Grooming",
    href: "https://www.meridiangrooming.com/",
    color: "#92500A",
    darkColor: "#E6A24F",
  },
  {
    label: "Convo Hub",
    href: "https://www.theconvohub.com/",
    color: "#6018B2",
    darkColor: "#A56BFF",
  },
  {
    label: "Font Check",
    href: "https://fontchecker.vercel.app/",
    color: "#A81240",
    darkColor: "#F06A97",
  },
  {
    label: "NoteKeys",
    href: "https://frontend-nine-sigma-73.vercel.app/",
    color: "#0D7A40",
    darkColor: "#43C37A",
  },
];

export const heroSummary: SummaryParagraph[] = [
  [
    {
      type: "text",
      value:
        "I’m a product designer with 6+ years of experience building digital products across web and mobile. I focus on simplifying complexity, improving usability, and creating systems that scale.",
    },
  ],
  [
    { type: "text", value: "I started as the founding UX designer at " },
    { type: "link", label: "Pangaea", href: "https://www.pangaea.holdings/" },
    {
      type: "text",
      value:
        ", working on the supply chain team. I designed internal tools that reduced data entry errors, improved visibility into critical workflows, and created clear paths for both new and power users. During this time, I also introduced and built the company’s first design system, aligning design and engineering, and enabling consistent product experiences across teams.",
    },
  ],
  [
    { type: "text", value: "I later worked on " },
    { type: "link", label: "Lumin Skin", href: "https://www.luminskin.com/" },
    {
      type: "text",
      value:
        ", a modern men’s skincare brand built around simple, effective routines, where I contributed to the website rebrand by designing assets that elevated the overall digital experience.",
    },
  ],
  [
    { type: "text", value: "At " },
    {
      type: "link",
      label: "Meridian Grooming",
      href: "https://www.meridiangrooming.com/",
    },
    {
      type: "text",
      value:
        ", a premium grooming brand, I led the design of a quiz and recommendation platform that helped users make confident product decisions. This initiative drove a 10% conversion rate and generated over $5M in business value.",
    },
  ],
  [
    { type: "text", value: "More recently, I led product design for " },
    { type: "link", label: "Convo Hub", href: "https://www.theconvohub.com/" },
    {
      type: "text",
      value:
        ", a community-driven platform built to foster meaningful conversations and connections. I owned the product end-to-end from idea to launch, working across web, iOS, and Android to bring the product to life.",
    },
  ],
  [{ type: "text", value: "Outside of my core work, I build and ship ideas." }],
  [
    { type: "text", value: "I created " },
    { type: "link", label: "Font Check", href: "https://fontchecker.vercel.app/" },
    {
      type: "text",
      value:
        ", a tool that simplifies font licensing by translating complex legal terms into clear, actionable guidance, helping designers and developers quickly understand how fonts can be used.",
    },
  ],
  [
    { type: "text", value: "I also built " },
    { type: "link", label: "NoteKeys", href: "https://frontend-nine-sigma-73.vercel.app/" },
    {
      type: "text",
      value:
        ", a tool for musicians and creatives to capture and interpret musical ideas more intuitively, bridging raw input with structured output.",
    },
  ],
  [
    {
      type: "text",
      value:
        "I care about building products that are clear, useful, and built to last.",
    },
  ],
];
