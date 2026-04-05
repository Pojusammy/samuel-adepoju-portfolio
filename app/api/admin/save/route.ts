import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveProjectContent, saveShowcaseContent, saveSiteContent } from "@/lib/admin-content";
import type { EditableProject, ShowcaseItem, SiteContent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { kind, payload } = (await request.json()) as {
      kind: "site" | "showcase" | "project";
      payload: SiteContent | ShowcaseItem[] | EditableProject;
    };

    if (kind === "site") {
      await saveSiteContent(payload as SiteContent);
      return NextResponse.json({ message: "Homepage content saved." });
    }

    if (kind === "showcase") {
      await saveShowcaseContent(payload as ShowcaseItem[]);
      return NextResponse.json({ message: "Showcase content saved." });
    }

    await saveProjectContent(payload as EditableProject);
    return NextResponse.json({ message: "Project saved." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save content." },
      { status: 500 },
    );
  }
}
