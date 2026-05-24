"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  House,
  User,
  LogOut,
  LayoutGrid,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";

function useMedia(query) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return match;
}

function TopAppBar({
  mobile,
  setOpen,
  displayName,
  roleName,
  menuOpen,
  setMenuOpen,
  handleSignOut,
  router,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
      <div className="app-shell flex h-16 items-center justify-between gap-3">
        {mobile ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-10 w-10" aria-hidden="true" />
        )}

        <div className="relative ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">{displayName}</p>
            {roleName && <p className="text-xs text-slate-500">{roleName}</p>}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
            aria-label="Open profile menu"
          >
            <User className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/profile");
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                โปรไฟล์
              </button>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function SidebarLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const desktop = useMedia("(min-width:1024px)");
  const mobile = !desktop;

  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    setMounted(true);
    setOpen(desktop);
  }, [desktop]);

  useEffect(() => {
    document.body.style.overflow = mobile && open ? "hidden" : "";
  }, [open, mobile]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setSession)
      .catch(() => router.replace("/"));
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    window.location.href = "/";
  };

  const displayName =
    session?.profile?.fullname || session?.user?.username || "Guest";

  const roleName = session?.role?.roles_name;
  const roleId = session?.role?.roles_id;
  const isAdmin = roleId === 1000 || roleId === 900;

  const links = useMemo(
    () => [{ href: "/user-psu/home", label: "Home", icon: House }],
    []
  );

  const linksAdmin = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/admin/system", label: "System", icon: Settings2 },
      { href: "/admin/users-data", label: "Users", icon: User },
    ],
    []
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="state-box">Loading...</div>
      </div>
    );
  }

  const SidebarItem = ({ href, label, icon: Icon }) => {
    const active = pathname.startsWith(href);
    const SafeIcon = Icon || Circle;

    return (
      <Link
        href={href}
        onClick={() => mobile && setOpen(false)}
        className={[
          "group flex items-center rounded-xl text-sm font-medium transition",
          open ? "h-10 gap-3 px-3" : "mx-auto h-10 w-10 justify-center",
          active
            ? "bg-white text-[#0b3a75] shadow-sm"
            : "text-slate-100 hover:bg-white/15 hover:text-white",
        ].join(" ")}
      >
        <SafeIcon className="h-5 w-5" />
        {open && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100/80">
      <aside
        className={[
          "fixed left-0 top-0 z-40 h-full border-r border-[#0d4b91] bg-gradient-to-b from-[#0c3f7f] to-[#0a2f5e] text-white transition-all duration-300 ease-out",
          desktop
            ? open
              ? "w-72"
              : "w-20"
            : open
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full",
        ].join(" ")}
      >
        <div className="border-b border-white/15 px-3 py-3">
          {desktop && !open ? (
            <div className="flex items-center justify-center">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-xs font-semibold tracking-wider text-white shadow-sm hover:bg-white/20"
                aria-label="Expand sidebar"
              >
                PSU
              </button>
            </div>
          ) : (
            <div className="grid items-center gap-2.5" style={{ gridTemplateColumns: "1fr auto" }}>
              <button
                onClick={() => desktop && !open && setOpen(true)}
                className="flex min-w-0 items-center gap-3 text-left"
                aria-label={open ? "Sidebar branding" : "Expand sidebar"}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/12 text-xs font-semibold tracking-wider shadow-sm">
                  PSU
                </span>
                {open && (
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold tracking-wide">TRIUP PSU</span>
                    <span className="block truncate text-[11px] text-blue-100/90">Research Management</span>
                  </span>
                )}
              </button>

              {desktop && open && (
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/8 text-white/90 hover:bg-white/15"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="scrollbar-thin h-[calc(100%-5.25rem)] overflow-y-auto p-3">
          <nav className="space-y-1.5">
            {links.map((item) => (
              <SidebarItem key={item.href} {...item} />
            ))}
          </nav>

          {isAdmin && (
            <>
              <div className="my-4 border-t border-white/15" />
              {open && (
                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-blue-100/75">
                  Admin
                </p>
              )}
              <nav className="space-y-1.5">
                {linksAdmin.map((item) => (
                  <SidebarItem key={item.href} {...item} />
                ))}
              </nav>
            </>
          )}
        </div>
      </aside>

      {mobile && open && (
        <div className="fixed inset-0 z-30 bg-slate-900/45 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
      )}

      <div
        className={[
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-300",
          desktop ? (open ? "ml-72" : "ml-20") : "ml-0",
        ].join(" ")}
      >
        <TopAppBar
          mobile={mobile}
          setOpen={setOpen}
          displayName={displayName}
          roleName={roleName}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
          router={router}
        />

        <main className="app-shell w-full py-5 md:py-7 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

