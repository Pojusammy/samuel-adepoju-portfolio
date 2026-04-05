"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import type { ProjectFrontmatter } from "@/lib/types";
import { formatListDate } from "@/lib/utils";

export function ProjectList({ projects }: { projects: ProjectFrontmatter[] }) {
  const [hoveredProject, setHoveredProject] = useState<ProjectFrontmatter | null>(null);
  const [hoverTop, setHoverTop] = useState(0);
  const [hoverLeft, setHoverLeft] = useState(0);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const groupedProjects = useMemo(() => {
    return projects.reduce<Record<string, ProjectFrontmatter[]>>((acc, project) => {
      const year = new Date(project.date).getFullYear().toString();
      acc[year] ??= [];
      acc[year].push(project);
      return acc;
    }, {});
  }, [projects]);

  const years = Object.keys(groupedProjects).sort((a, b) => Number(b) - Number(a));

  return (
    <div ref={containerRef} className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden xl:block">
        <AnimatePresence mode="wait">
          {hoveredProject ? (
            <motion.div
              key={hoveredProject.slug}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[2px] border-background bg-black shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
              style={{ top: hoverTop, left: hoverLeft }}
            >
              <div className="relative size-[48px] overflow-hidden rounded-full">
                <Image
                  src={hoveredProject.thumbnail}
                  alt={hoveredProject.thumbnailAlt}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="border-t border-line">
        {years.map((year) => (
          <div key={year} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 py-0 sm:grid-cols-[56px_1fr] sm:gap-8">
            <div className="pt-3 text-[13px] leading-5 text-foreground-faint">{year}</div>
            <div>
              {groupedProjects[year].map((project, index) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line py-[14px] sm:gap-4"
                  onMouseEnter={(event) => {
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    const parentTop = containerRect?.top ?? 0;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const defaultLeft = containerRect ? containerRect.width * 0.56 : 0;
                    setHoverTop(rect.top - parentTop + rect.height / 2);
                    setHoverLeft(defaultLeft);
                    setHoveredProject(project);
                  }}
                  onMouseMove={(event) => {
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (!containerRect) return;
                    const x = event.clientX - containerRect.left;
                    const y = event.currentTarget.getBoundingClientRect().top - containerRect.top + event.currentTarget.getBoundingClientRect().height / 2;
                    const clampedX = Math.max(containerRect.width * 0.5, Math.min(containerRect.width * 0.72, x));
                    setHoverLeft(clampedX);
                    setHoverTop(y);
                  }}
                  onMouseLeave={() => setHoveredProject((current) => (current?.slug === project.slug ? null : current))}
                >
                  <div className="truncate pr-2 text-[13.5px] leading-[22px] text-foreground/80 transition-opacity duration-200 group-hover:opacity-75 sm:text-[15px]">
                    {project.title}
                  </div>
                  <div className="text-[13px] leading-5 text-foreground-faint">
                    {formatListDate(project.date)}
                  </div>
                  {index === groupedProjects[year].length - 1 ? <div className="col-span-full" /> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
