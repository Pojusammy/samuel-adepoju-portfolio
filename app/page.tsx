import Image from "next/image";
import Link from "next/link";

import { ContactSection } from "@/components/contact-section";
import { DesignShowcaseList } from "@/components/design-showcase-list";
import { Hero } from "@/components/hero";
import { ProjectList } from "@/components/project-list";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
import { ThemeToggle } from "@/components/theme-toggle";
import { showcaseItems } from "@/data/showcase";
import { topBarLinks } from "@/data/site";
import { getAllProjects } from "@/lib/projects";

export default async function HomePage() {
  const projects = (await getAllProjects()).filter((project) =>
    [
      "convo-hub-launch",
      "font-check-clarity",
      "notekeys-structured-music",
      "meridian-quiz-platform",
      "pangaea-design-system",
    ].includes(project.slug),
  );

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 pb-24 pt-4 sm:px-0 sm:pt-8">
      <div className="flex items-center py-5 sm:py-8">
        <div className="flex-1">
          <Link href="/" className="relative block size-6">
            <Image src="/images/figma/mark.svg" alt="Samuel Adepoju mark" fill className="site-mark object-contain" sizes="24px" />
          </Link>
        </div>
        <div className="flex items-center gap-6 text-[14px] leading-5 text-foreground-muted">
          {topBarLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-foreground"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>

      <div>
        <Hero />
      </div>

      <Reveal>
        <section id="live-projects" className="mt-14 pt-8">
          <SectionLabel>Live Projects</SectionLabel>
          <ProjectList projects={projects} />
        </section>
      </Reveal>

      <Reveal>
        <section id="design-showcase" className="mt-16 pt-8">
          <SectionLabel>Design Showcase</SectionLabel>
          <DesignShowcaseList items={showcaseItems} />
        </section>
      </Reveal>

      <Reveal>
        <section className="mt-8 border-t border-line pt-20">
          <ContactSection />
        </section>
      </Reveal>
    </main>
  );
}
