import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatListDate(date: string) {
  const parsed = new Date(date);

  return `${String(parsed.getDate()).padStart(2, "0")}/${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

export function getMediaTypeFromPath(path?: string) {
  if (!path) return "image" as const;

  const cleanPath = path.split("?")[0]?.split("#")[0] ?? path;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanPath) ? ("video" as const) : ("image" as const);
}

export function resolveMediaSrc(src?: string) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (!src.startsWith("/")) return src;
  if (process.env.VERCEL !== "1") return src;

  const owner = process.env.GITHUB_REPO_OWNER ?? "Pojusammy";
  const repo = process.env.GITHUB_REPO_NAME ?? "samuel-adepoju-portfolio";
  const branch = process.env.GITHUB_REPO_BRANCH ?? "main";

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/public${src}`;
}
