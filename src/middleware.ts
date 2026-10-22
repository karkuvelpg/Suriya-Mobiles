import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware — refreshes Supabase auth session on every request.
 * Also enforces route-level access control.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes("your-project-id");

  let user = null;

  // Only attempt network auth call if real Supabase credentials are configured
  if (!isPlaceholderUrl && supabaseKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // In case of network timeout or offline dev, fail gracefully
      user = null;
    }
  }

  const pathname = request.nextUrl.pathname;

  // Check for local demo session cookie if offline / development
  const demoRoleCookie = request.cookies.get("demo_role");
  const isAuthenticated = !!user || !!demoRoleCookie || isPlaceholderUrl;

  // ─── Auth Guard for Protected Admin / POS Paths ───────────────────────────
  const protectedPaths = ["/dashboard", "/pos", "/inventory", "/repairs", "/sales", "/customers", "/reports", "/settings"];
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ─── Already logged in — redirect away from login page ─────────────────────
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - api/webhooks (payment gateway webhooks — verified server-side, not auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)",
  ],
};
