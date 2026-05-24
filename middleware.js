import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ admin â†’ à¸œà¹ˆà¸²à¸™
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // à¸«à¸™à¹‰à¸² login-admin â†’ à¸œà¹ˆà¸²à¸™
  if (pathname.startsWith("/admin/login-admin")) {
    return NextResponse.next();
  }

  // à¸­à¹ˆà¸²à¸™ cookie admin
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

    // à¸­à¸™à¸¸à¸à¸²à¸•à¹€à¸‰à¸žà¸²à¸° ADMIN (1000) / CEO (900)
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


