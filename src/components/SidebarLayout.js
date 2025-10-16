"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu as BurgerIcon, House, User, List, LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { isAdmin } from "@/utils/role";

/* ---------- utils: hook ตรวจ media query ---------- */
function useMedia(query) {
  const [match, setMatch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [query]);

  return match;
}

/* ---------- utils: safe localStorage ---------- */
const safeGet = (k, d = null) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const safeSet = (k, v) => {
  try {
    locallocalStorage.setItem(k, v);
  } catch {}
};

/* -------------------------------------------------- */
/* -------------------- APP BAR --------------------- */
/* -------------------------------------------------- */

function TopAppBar({ displayName, roleName, onToggleSidebar }) {
  return (
    <div className="h-14 flex items-center justify-between bg-white border-b border-black/10 px-4 shadow-sm sticky top-0 z-40">

      {/* LEFT: Menu button + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg border border-black/10 hover:bg-black/5"
        >
          <BurgerIcon className="h-5 w-5" />
        </button>

        <div className="font-semibold text-lg tracking-wide">
          PSU Triup Act
        </div>
      </div>

      {/* RIGHT: User info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-black/60">role: {roleName}</div>
        </div>

        <div className="h-9 w-9 bg-black text-white rounded-full flex items-center justify-center font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* -------------------- LAYOUT ---------------------- */
/* -------------------------------------------------- */

export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleReady, setRoleReady] = useState(false);
  const pathname = usePathname();
  const desktop = useMedia("(min-width:1024px)");
  const router = useRouter();
  const [roleName, setRoleName] = useState(null);

  /* Load Session */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("psuSession");
      if (raw) {
        const session = JSON.parse(raw);
        setSession(session);
        setRoleName(session?.user?.role_name || "ไม่พบสิทธิ์");
      }
    } finally {
      setRoleReady(true);
    }
  }, []);

  /* Theme */
  useEffect(() => {
    document.documentElement.style.setProperty("--bg", "255 255 255");
    document.documentElement.style.setProperty("--fg", "0 0 0");
  }, []);

  /* Load sidebar state */
  useEffect(() => {
    if (safeGet("sidebar:open") === "true") setOpen(true);
  }, []);
  useEffect(() => safeSet("sidebar:open", String(open)), [open]);

  /* Scroll lock */
  useEffect(() => {
    document.body.style.overflow = !desktop && open ? "hidden" : "";
  }, [open, desktop]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeOnMobile = () => {
    if (!desktop) setOpen(false);
  };

  /* Navigation Menu */
  const links = useMemo(
    () => [{ href: "/home", label: "Home", icon: House }],
    []
  );

  const links_admin = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", icon: House },
      { href: "/admin/manage-users", label: "Manage Users", icon: User },
    ],
    []
  );

  /* Logout */
  async function handleSignOut() {
    const ok = await Swal.fire({
      title: "ออกจากระบบ",
      html: `<p style="margin-top:6px;font-size:.9rem;color:#4B5563">คุณต้องการออกจากระบบหรือไม่</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      buttonsStyling: false,
      background: "#ffffff",
      color: "#0B0B0B",
      customClass: {
        popup: "rounded-xl border border-black/10 shadow-sm",
        cancelButton:
          "rounded-lg px-4 py-2 text-sm font-medium text-white bg-[#0088FF]",
        confirmButton:
          "ml-2 rounded-lg px-4 py-2 text-sm font-medium text-[#006AD1] bg-[#E3F1FF]",
      },
    }).then((r) => r.isConfirmed);

    if (!ok) return;

    localStorage.removeItem("psuSession");

    await Swal.fire({
      toast: true,
      icon: "success",
      title: "ออกจากระบบแล้ว",
      timer: 1100,
      position: "top-end",
      showConfirmButton: false,
    });

    router.replace("/");
  }

  /* Display names */
  const displayName =
    session?.profile?.fullname ||
    `${session?.profile?.first_name ?? ""} ${
      session?.profile?.last_name ?? ""
    }`.trim() ||
    session?.user?.username ||
    "Guest";

  const displayUsername =
    session?.profile?.user_id || session?.user?.user_id || "unknown";

  /* -------------------------------------------------- */
  /* --------------------- RENDER ---------------------- */
  /* -------------------------------------------------- */

  return (
    <div className="flex min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-white text-black shadow-xl ring-1 ring-black/10
          transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-black/10">
          <div className="h-9 w-9 bg-black text-white rounded-xl flex items-center justify-center font-bold">
            P
          </div>
          <span className="font-semibold text-sm">PSU Triup Act</span>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          <div className="text-xs uppercase tracking-wide text-black/50 mb-2">
            Menu
          </div>

          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeOnMobile}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-black/5 text-black ring-1 ring-black/10"
                    : "text-black/70 hover:bg-black/5"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Menu */}
        {roleReady && isAdmin() && (
          <nav className="p-4 space-y-1">
            <div className="text-xs uppercase tracking-wide text-black/50 mb-2">
              Menu Admin
            </div>

            {links_admin.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeOnMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                  ${
                    active
                      ? "bg-black/5 text-black ring-1 ring-black/10"
                      : "text-black/70 hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Panel */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-black/10 bg-black/[.03]">
          <div className="relative flex items-center gap-3">

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-9 w-9 bg-black text-white rounded-full flex items-center justify-center font-semibold hover:opacity-90"
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{displayName}</div>
              <div className="text-xs text-black/60 truncate">
                role: {roleReady ? roleName : ""}
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="ml-auto p-2 rounded-lg hover:bg-black/5"
            >
              <List className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-12 w-44 bg-white border border-black/10 rounded-lg shadow-lg py-1 animate-fade-in">
                
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-black/5"
                >
                  <User className="h-4 w-4" />
                  โปรไฟล์
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/list");
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm hover:bg-black/5"
                >
                  <List className="h-4 w-4" />
                  รายการ
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 px-3 py-2 w-full text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  ออกจากระบบ
                </button>

              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Area */}
      <div
        className={`flex-1 transition-[margin] duration-200 ${
          open ? "lg:ml-72" : "lg:ml-0"
        }`}
      >
        {/* ⭐ NEW TOP APP BAR ⭐ */}
        <TopAppBar
          displayName={displayName}
          roleName={roleName}
          onToggleSidebar={() => setOpen(!open)}
        />

        <main className="mx-auto">{children}</main>
      </div>
    </div>
  );
}
