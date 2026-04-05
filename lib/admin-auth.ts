import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE = "samuel-admin-session";
const SESSION_VALUE = "authenticated";

function getSecret() {
  return process.env.ADMIN_SECRET ?? "local-admin-secret";
}

function signValue(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function getPassword() {
  return process.env.ADMIN_PASSWORD;
}

export function isAdminConfigured() {
  return Boolean(getPassword());
}

export function isValidAdminPassword(password: string) {
  const configuredPassword = getPassword();

  if (!configuredPassword) return false;

  const left = Buffer.from(password);
  const right = Buffer.from(configuredPassword);

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

export function createAdminSessionToken() {
  return `${SESSION_VALUE}.${signValue(SESSION_VALUE)}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) return false;

  const [value, signature] = token.split(".");
  if (!value || !signature || value !== SESSION_VALUE) return false;

  const expected = signValue(value);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
