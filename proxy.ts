import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Wrap Clerk's middleware so we can stash the request pathname in a header
// the dashboard layout reads (used to highlight the active brand in the
// sidebar switcher and to fetch the active brand's doc count).
export const proxy = clerkMiddleware(async (_auth, req) => {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", req.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
