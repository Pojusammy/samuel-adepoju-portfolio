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
