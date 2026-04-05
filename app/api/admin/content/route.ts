import { NextResponse } from "next/server";

import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { getAdminContent } from "@/lib/admin-content";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getAdminContent();
  return NextResponse.json(content);
}
