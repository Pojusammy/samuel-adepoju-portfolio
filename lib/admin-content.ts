import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import type { EditableProject, ShowcaseItem, SiteContent } from "@/lib/types";

const SITE_PATH = path.join(process.cwd(), "data/site.json");
const SHOWCASE_PATH = path.join(process.cwd(), "data/showcase.json");
const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public/images");

type SaveTarget = {
  repoPath: string;
  content: string;
  message: string;
  isBase64?: boolean;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const source = await fs.readFile(filePath, "utf8");
  return JSON.parse(source) as T;
}

function getGitHubConfig() {
  const token = process.env.GITHUB_ADMIN_TOKEN;

  if (!token) return null;

  return {
    token,
    owner: process.env.GITHUB_REPO_OWNER ?? "Pojusammy",
    repo: process.env.GITHUB_REPO_NAME ?? "samuel-adepoju-portfolio",
    branch: process.env.GITHUB_REPO_BRANCH ?? "main",
  };
}

async function saveToGitHub({ repoPath, content, message, isBase64 }: SaveTarget) {
  const config = getGitHubConfig();
  if (!config) return false;

  const endpoint = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repoPath}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${config.token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  let sha: string | undefined;
  const existingResponse = await fetch(`${endpoint}?ref=${config.branch}`, { headers, cache: "no-store" });

  if (existingResponse.ok) {
    const existing = (await existingResponse.json()) as { sha?: string };
    sha = existing.sha;
  } else if (existingResponse.status !== 404) {
    throw new Error("Could not fetch the existing GitHub file.");
  }

  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message,
      branch: config.branch,
      content: isBase64 ? content : Buffer.from(content).toString("base64"),
      sha,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub save failed: ${error}`);
  }

  return true;
}

async function saveTarget(target: SaveTarget, localPath?: string) {
  const savedRemotely = await saveToGitHub(target);

  if (!savedRemotely) {
    if (!localPath) throw new Error("Local path missing for fallback save.");
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, target.isBase64 ? Buffer.from(target.content, "base64") : target.content);
  }
}

function stringifyJson(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export async function getAdminContent() {
  const [site, showcase] = await Promise.all([
    readJsonFile<SiteContent>(SITE_PATH),
    readJsonFile<ShowcaseItem[]>(SHOWCASE_PATH),
  ]);

  const files = await fs.readdir(PROJECTS_DIR);
  const projects = await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const filePath = path.join(PROJECTS_DIR, file);
        const source = await fs.readFile(filePath, "utf8");
        const { content, data } = matter(source);
        return {
          slug: file.replace(/\.mdx$/, ""),
          ...(data as Omit<EditableProject, "slug" | "body">),
          body: content.trim(),
        } satisfies EditableProject;
      }),
  );

  projects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { site, showcase, projects };
}

export async function saveSiteContent(site: SiteContent) {
  const content = stringifyJson(site);
  await saveTarget(
    {
      repoPath: "data/site.json",
      content,
      message: "Update homepage content",
    },
    SITE_PATH,
  );
}

export async function saveShowcaseContent(showcase: ShowcaseItem[]) {
  const content = stringifyJson(showcase);
  await saveTarget(
    {
      repoPath: "data/showcase.json",
      content,
      message: "Update showcase content",
    },
    SHOWCASE_PATH,
  );
}

export async function saveProjectContent(project: EditableProject) {
  const { slug, body, ...frontmatter } = project;
  const content = matter.stringify(`${body.trim()}\n`, frontmatter);
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);

  await saveTarget(
    {
      repoPath: `content/projects/${slug}.mdx`,
      content,
      message: `Update project: ${project.title}`,
    },
    filePath,
  );
}

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

function sanitizeFileName(value: string) {
  const extension = path.extname(value).toLowerCase();
  const name = path.basename(value, extension);
  const safeName = sanitizePathSegment(name) || "image";
  return `${safeName}${extension}`;
}

export async function uploadImageAsset(file: File, folder: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeFolder = sanitizePathSegment(folder) || "uploads";
  const safeFileName = sanitizeFileName(file.name);
  const repoPath = `public/images/${safeFolder}/${safeFileName}`;
  const localPath = path.join(PUBLIC_IMAGES_DIR, safeFolder, safeFileName);

  await saveTarget(
    {
      repoPath,
      content: bytes.toString("base64"),
      message: `Upload image: ${safeFileName}`,
      isBase64: true,
    },
    localPath,
  );

  return `/images/${safeFolder}/${safeFileName}`;
}
