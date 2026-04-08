import fs from "node:fs/promises";
import path from "node:path";

import type { ShowcaseItem } from "@/lib/types";

const SHOWCASE_PATH = path.join(process.cwd(), "data/showcase.json");

async function readLocalShowcase() {
  const source = await fs.readFile(SHOWCASE_PATH, "utf8");
  return JSON.parse(source) as ShowcaseItem[];
}

export async function getShowcaseItems() {
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_REPO_BRANCH ?? "main";

  if (owner && repo) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/data/showcase.json`,
        { cache: "no-store" },
      );

      if (response.ok) {
        return (await response.json()) as ShowcaseItem[];
      }
    } catch {
      // Fall back to the bundled/local file when GitHub is unavailable.
    }
  }

  return readLocalShowcase();
}
