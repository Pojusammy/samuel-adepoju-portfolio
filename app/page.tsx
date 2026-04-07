import { ContactSection } from "@/components/contact-section";
import { DesignShowcaseList } from "@/components/design-showcase-list";
import { Hero } from "@/components/hero";
import { PageHeader } from "@/components/page-header";
import { ProjectList } from "@/components/project-list";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
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
      <PageHeader links={topBarLinks} />

      <div>
        <Hero />
      </div>

      <Reveal delay={0.04}>
        <section id="live-projects" className="mt-14 pt-8">
          <SectionLabel>Live Projects</SectionLabel>
          <ProjectList projects={projects} />
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section id="design-showcase" className="mt-16 pt-8">
          <SectionLabel>Design Showcase</SectionLabel>
          <DesignShowcaseList items={showcaseItems} />
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mt-8 border-t border-line pt-20">
          <ContactSection />
        </section>
      </Reveal>
    </main>
  );
}
