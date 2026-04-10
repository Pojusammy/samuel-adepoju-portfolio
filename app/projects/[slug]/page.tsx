import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteMeta } from "@/data/site";
import { getAllProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects";
import { formatDate, getMediaTypeFromPath, resolveMediaSrc } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const coverMediaType = getMediaTypeFromPath(project.coverImage);

  return {
    title: project.title,
    description: project.excerpt,
    openGraph: {
      title: project.title,
      description: project.excerpt,
      url: `${siteMeta.url}/projects/${project.slug}`,
      images:
        project.coverImage && coverMediaType === "image"
          ? [{ url: project.coverImage, alt: project.coverAlt ?? project.title }]
          : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getAllProjects();
  const currentIndex = allProjects.findIndex((item) => item.slug === slug);
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];
  const coverMediaType = getMediaTypeFromPath(project.coverImage);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-16 sm:px-7 lg:px-10 lg:pb-32">
      <div className="mx-auto max-w-[42rem]">
        <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
          Back to home
        </Link>
        <header className="mt-8 border-b border-line pb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">
            {formatDate(project.date)}
          </p>
          <h1 className="mt-4 text-[clamp(2.6rem,5vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-foreground">
            {project.title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[1.02rem] leading-8 text-foreground-soft">
            {project.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-foreground-soft">
            {project.role ? <p>Role: {project.role}</p> : null}
            {project.liveUrl ? (
              <Link href={project.liveUrl} className="site-link" target="_blank" rel="noreferrer">
                Visit live project
              </Link>
            ) : null}
          </div>
        </header>

        {project.coverImage ? (
          <div className="relative mt-10 overflow-hidden rounded-[1.9rem] border border-line bg-background-soft shadow-soft">
            <div className="relative aspect-[16/10]">
              {coverMediaType === "video" ? (
                <video
                  src={resolveMediaSrc(project.coverImage)}
                  title={project.coverAlt ?? project.title}
                  className="h-full w-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={resolveMediaSrc(project.coverImage)}
                  alt={project.coverAlt ?? project.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 680px"
                />
              )}
            </div>
          </div>
        ) : null}

        <article className="prose-editorial mt-12">{project.content}</article>

        <div className="mt-16 border-t border-line pt-7">
          <p className="text-xs uppercase tracking-[0.24em] text-foreground-muted">Next project</p>
          <Link href={`/projects/${nextProject.slug}`} className="mt-3 inline-block text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground hover:opacity-80">
            {nextProject.title}
          </Link>
        </div>
      </div>
    </main>
  );
}
