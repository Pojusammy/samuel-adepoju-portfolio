import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";

import { mdxComponents } from "@/components/mdx-components";
import type { ProjectFrontmatter, ProjectPageData } from "@/lib/types";

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export async function getProjectSlugs() {
  const files = await fs.readdir(PROJECTS_DIR);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}

export async function getAllProjects(): Promise<ProjectFrontmatter[]> {
  const slugs = await getProjectSlugs();

  const projects = await Promise.all(
    slugs.map(async (slug) => {
      const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
      const source = await fs.readFile(filePath, "utf8");
      const { data } = matter(source);

      return {
        slug,
        ...(data as Omit<ProjectFrontmatter, "slug">),
      };
    }),
  );

  return projects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getProjectBySlug(slug: string): Promise<ProjectPageData | null> {
  try {
    const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
    const source = await fs.readFile(filePath, "utf8");

    const { content, frontmatter } = await compileMDX<Omit<ProjectFrontmatter, "slug">>({
      source,
      components: mdxComponents,
      options: { parseFrontmatter: true },
    });

    return {
      slug,
      ...frontmatter,
      content,
    };
  } catch {
    return null;
  }
}
