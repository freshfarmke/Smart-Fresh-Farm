import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn("middleware: SUPABASE env vars not fully configured. RBAC checks may fail.");
}

function pathMatches(pathname: string, rulePath: string) {
  return pathname === rulePath || pathname.startsWith(`${rulePath}/`);
}

function isAllowed(pathname: string, role: string | null) {
  if (!role) return false;
  if (role === "admin") return true;

  const rules: Array<{ path: string; roles: string[] }> = [
    { path: "/dashboard/production", roles: ["production"] },
    { path: "/dashboard/routes", roles: ["production"] },
    { path: "/dashboard/institutions", roles: ["production"] },
    { path: "/dashboard/finance", roles: ["finance"] },
  ];

  for (const r of rules) {
    if (pathMatches(pathname, r.path)) return r.roles.includes(role);
  }

  return false;
}

function createSupabaseServer(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as any);
        });
      },
    },
  });

  return { supabase, response } as const;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const { supabase, response } = createSupabaseServer(req);

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (userErr || !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Fetch profile role using service role key (server-side only)
  try {
    const url = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    url.searchParams.set("select", "role");
    url.searchParams.set("id", `eq.${user.id}`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const u = req.nextUrl.clone();
      u.pathname = "/unauthorized";
      return NextResponse.redirect(u);
    }

    const rows = (await res.json()) as Array<{ role?: string }>;
    const role = rows && rows.length > 0 ? rows[0].role ?? null : null;

    if (!role) {
      const u = req.nextUrl.clone();
      u.pathname = "/unauthorized";
      return NextResponse.redirect(u);
    }

    if (!isAllowed(pathname, role)) {
      const u = req.nextUrl.clone();
      u.pathname = "/unauthorized";
      return NextResponse.redirect(u);
    }

    return response;
  } catch (err) {
    const u = req.nextUrl.clone();
    u.pathname = "/unauthorized";
    return NextResponse.redirect(u);
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
