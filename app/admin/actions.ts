"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  isAdminConfigured,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export async function loginAction(_: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return { error: "Set ADMIN_PASSWORD in your environment before using the admin." };
  }

  if (!isValidAdminPassword(password)) {
    return { error: "That password didn’t match. Try again." };
  }

  await setAdminSessionCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin");
}
