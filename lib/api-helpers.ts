import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * Every route under app/api/v1/** is meant to be called from the mobile
 * app (a different "origin" than the website), not just the browser.
 * Browsers refuse cross-origin requests unless the server explicitly
 * allows them — that's what these headers are for. Without this, the
 * Expo app's fetch() calls would fail with a CORS error before your
 * code even runs.
 *
 * NOTE: "*" is fine while we're building. Before shipping, replace it
 * with your actual app's origin/scheme for tighter security.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Wrap any JSON response so it carries the CORS headers above. */
export function apiJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers || {}) },
  });
}

/**
 * Every route file should export this as OPTIONS. The browser/Expo
 * runtime sends an OPTIONS "preflight" request before the real one,
 * just to ask "am I allowed to call this?" — this answers "yes".
 */
export function apiOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Use at the top of any route that requires a signed-in user.
 * Returns { user } on success, or a ready-to-return 401 response on failure.
 *
 * Usage:
 *   const check = await requireUser();
 *   if (check instanceof NextResponse) return check;
 *   const { user } = check;
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return apiJson({ error: "Unauthorized" }, { status: 401 });
  }
  return { user };
}

/** Same as requireUser, but also requires role === "ADMIN". */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    return apiJson({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return apiJson({ error: "Forbidden" }, { status: 403 });
  }
  return { user };
}