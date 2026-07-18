import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/equipment/checkout(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Step 1: all protected routes require sign-in
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Step 2: admin routes require the ADMIN role
  // This check runs at the edge — before ANY page code executes
  if (isAdminRoute(req)) {
    const { sessionClaims, redirectToSignIn } = await auth();

    // Not signed in at all
    if (!sessionClaims) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Signed in but not admin
    const role = (sessionClaims?.metadata as any)?.role;
    if (role !== "ADMIN") {
      // Redirect to account page — don't reveal admin exists
      return NextResponse.redirect(new URL("/account", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};