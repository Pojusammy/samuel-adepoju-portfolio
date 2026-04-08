import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import type { EditableProject, ProjectContentBlock, ShowcaseItem, SiteContent } from "@/lib/types";

const SITE_PATH = path.join(process.cwd(), "data/site.json");
const SHOWCASE_PATH = path.join(process.cwd(), "data/showcase.json");
const PROJECTS_DIR = path.join(process.cwd(), "content/projects");
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public/images");

function createBlockId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function escapeAttribute(value: string) {
  return value.replace(/"/g, "&quot;");
}

export function parseProjectBody(body: string): ProjectContentBlock[] {
  const normalized = body.trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const blocks: ProjectContentBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith('<ContentImage ')) {
      const src = line.match(/src="([^"]*)"/)?.[1] ?? "";
      const alt = line.match(/alt="([^"]*)"/)?.[1] ?? "";
      const caption = line.match(/caption="([^"]*)"/)?.[1];
      blocks.push({
        id: createBlockId("image"),
        type: "image",
        src,
        alt,
        caption,
      });
      index += 1;
      continue;
    }

    if (line.startsWith('<ContentVideo ')) {
      const src = line.match(/src="([^"]*)"/)?.[1] ?? "";
      const title = line.match(/title="([^"]*)"/)?.[1] ?? "";
      const caption = line.match(/caption="([^"]*)"/)?.[1];
      const poster = line.match(/poster="([^"]*)"/)?.[1];
      blocks.push({
        id: createBlockId("video"),
        type: "video",
        src,
        alt: title,
        caption,
        poster,
      });
      index += 1;
      continue;
    }

    if (line.startsWith("<Callout ")) {
      const title = line.match(/title="([^"]*)"/)?.[1] ?? "Callout";
      index += 1;
      const calloutLines: string[] = [];

      while (index < lines.length && !lines[index].trim().startsWith("</Callout>")) {
        calloutLines.push(lines[index]);
        index += 1;
      }

      blocks.push({
        id: createBlockId("callout"),
        type: "callout",
        title,
        body: calloutLines.join("\n").trim(),
      });

      if (index < lines.length) index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const title = line.replace(/^##\s+/, "").trim();
      index += 1;
      const sectionLines: string[] = [];

      while (index < lines.length) {
        const nextLine = lines[index].trim();
        if (
          nextLine.startsWith("## ") ||
          nextLine.startsWith("<Callout ") ||
          nextLine.startsWith('<ContentImage ') ||
          nextLine.startsWith('<ContentVideo ')
        ) {
          break;
        }
        sectionLines.push(lines[index]);
        index += 1;
      }

      blocks.push({
        id: createBlockId("section"),
        type: "section",
        title,
        body: sectionLines.join("\n").trim(),
      });
      continue;
    }

    const looseLines: string[] = [];
    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (
        nextLine.startsWith("## ") ||
        nextLine.startsWith("<Callout ") ||
        nextLine.startsWith('<ContentImage ') ||
        nextLine.startsWith('<ContentVideo ')
      ) {
        break;
      }
      looseLines.push(lines[index]);
      index += 1;
    }

    blocks.push({
      id: createBlockId("section"),
      type: "section",
      title: "",
      body: looseLines.join("\n").trim(),
    });
  }

  return blocks;
}

export function serializeProjectBlocks(blocks: ProjectContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "section") {
        const heading = block.title.trim() ? `## ${block.title.trim()}\n\n` : "";
        return `${heading}${block.body.trim()}`.trim();
      }

      if (block.type === "image") {
        const caption = block.caption?.trim()
          ? ` caption="${escapeAttribute(block.caption.trim())}"`
          : "";
        return `<ContentImage src="${escapeAttribute(block.src.trim())}" alt="${escapeAttribute(
          block.alt.trim(),
        )}"${caption} />`;
      }

      if (block.type === "video") {
        const caption = block.caption?.trim()
          ? ` caption="${escapeAttribute(block.caption.trim())}"`
          : "";
        const poster = block.poster?.trim()
          ? ` poster="${escapeAttribute(block.poster.trim())}"`
          : "";
        return `<ContentVideo src="${escapeAttribute(block.src.trim())}" title="${escapeAttribute(
          block.alt.trim(),
        )}"${poster}${caption} />`;
      }

      return `<Callout title="${escapeAttribute(block.title.trim())}">

${block.body.trim()}

</Callout>`;
    })
    .filter(Boolean)
    .join("\n\n");
}

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
          blocks: parseProjectBody(content),
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
  const { slug, body, blocks, ...frontmatter } = project;
  const finalBody = blocks?.length ? serializeProjectBlocks(blocks) : body;
  const content = matter.stringify(`${finalBody.trim()}\n`, frontmatter);
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
