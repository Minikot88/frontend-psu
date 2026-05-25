import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const ADMIN_SYSTEM_PATH = "/admin/system";

  // not admin -> allow
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // admin login page -> allow
  if (pathname.startsWith("/admin/login-admin")) {
    return NextResponse.next();
  }

  // Require admin auth only for /admin/system
  if (!pathname.startsWith(ADMIN_SYSTEM_PATH)) {
    return NextResponse.next();
  }

  // read admin cookie
  const token = req.cookies.get("admin_session")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login-admin";
    return NextResponse.redirect(url);
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/login-api-triup/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("invalid");

    const data = await res.json();
    const roleId =
      data?.user?.roles_id ??
      data?.session?.roles_id ??
      data?.role?.roles_id;

    // allow only ADMIN (1000) / CEO (900)
    if (![1000, 900].includes(roleId)) {
      const url = req.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login-admin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};


