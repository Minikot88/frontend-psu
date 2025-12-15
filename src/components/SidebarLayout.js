"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Menu as BurgerIcon,
  House,
  User,
  List,
  LogOut,
  ChevronDown,
} from "lucide-react";

import Swal from "sweetalert2";
import { isAdmin } from "@/utils/role";

/* ---------- Hook: Media Query ---------- */
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

/* ---------- Safe Local Storage ---------- */
const safeGet = (k, d = null) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const safeSet = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

/* -------------------------------------------------- */
/* -------------------- TOP APP BAR ------------------ */
/* -------------------------------------------------- */

function TopAppBar({
  displayName,
  roleName,
  menuOpen,
  setMenuOpen,
  handleSignOut,
  router,
}) {
  return (
    <div
      className="h-14 flex items-center justify-between
      bg-white/90 backdrop-blur-md border-b border-black/10
      px-4 shadow-sm sticky top-0 z-40"
    >
      {/* LEFT — intentionally empty */}  
      <div></div>

      {/* RIGHT SIDE: Profile Section */}
      <div className="relative flex items-center gap-3">
        <div className="text-right mr-1">
          <div className="text-sm font-semibold">{displayName}</div>
          <div className="text-xs text-black/50">{roleName}</div>
        </div>

        {/* Modern Circular Profile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative h-10 w-10 rounded-full
          bg-gradient-to-br from-black to-gray-700 text-white 
          flex items-center justify-center shadow-md
          hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          <User className="h-4 w-4 opacity-90" />

          <ChevronDown
            className="h-3 w-3 absolute bottom-0 right-0 
          bg-white text-black rounded-full p-[1px]"
          />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-14 w-48
            bg-white/90 backdrop-blur-lg border border-black/10
            rounded-xl shadow-xl py-2 z-50 animate-fade-in"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5"
            >
              <User className="h-4 w-4" />
              โปรไฟล์
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                router.push("/list");
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5"
            >
              <List className="h-4 w-4" />
              รายการ
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* -------------------- SIDEBAR LAYOUT --------------- */
/* -------------------------------------------------- */

export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleReady, setRoleReady] = useState(false);
  const [roleName, setRoleName] = useState(null);

  const pathname = usePathname();
  const desktop = useMedia("(min-width:1024px)");
  const router = useRouter();

  /* Load session */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("psuSession");
      if (raw) {
        const s = JSON.parse(raw);
        setSession(s);
        setRoleName(s?.user?.role_name || "ไม่พบสิทธิ์");
      }
    } finally {
      setRoleReady(true);
    }
  }, []);

  /* Restore sidebar open state */
  useEffect(() => {
    if (safeGet("sidebar:open") === "true") setOpen(true);
  }, []);
  useEffect(() => safeSet("sidebar:open", String(open)), [open]);

  /* Prevent body scroll when sidebar is open on mobile */
  useEffect(() => {
    document.body.style.overflow = !desktop && open ? "hidden" : "";
  }, [open, desktop]);

  const closeOnMobile = () => {
    if (!desktop) setOpen(false);
  };

  /* Sidebar menu items */
  const links = useMemo(
    () => [{ href: "/user-psu/home", label: "Home", icon: House }],
    []
  );

  const links_admin = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard", icon: House },
      { href: "/admin/users-data", label: "Manage Users", icon: User },
    ],
    []
  );

  const handleSignOut = async () => {
    localStorage.removeItem("psuSession");
    router.replace("/");
  };

  /* Display Name */
  const displayName =
    session?.profile?.fullname ||
    `${session?.profile?.first_name ?? ""} ${
      session?.profile?.last_name ?? ""
    }`.trim() ||
    session?.user?.username ||
    "Guest";

  /* ----------------------------- RENDER ----------------------------- */

  return (
    <div className="flex min-h-dvh bg-white text-black">
      {/* ---------------------- SIDEBAR ---------------------- */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full 
          bg-white/80 backdrop-blur-xl
          shadow-lg ring-1 ring-black/10
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${open ? "w-72" : "w-16"}
        `}
      >
        {/* SIDEBAR HEADER — MATCHED WITH TopAppBar */}
        <div
          className="flex items-center gap-3 
          h-14 px-4 
          bg-white/90 backdrop-blur-md
          border-b border-black/10 
          shadow-sm"
        >
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg border border-black/10
            hover:bg-black/5 hover:scale-110 active:scale-95 transition"
          >
            <BurgerIcon className="h-5 w-5 text-black" />
          </button>

          {open && (
            <span className="text-sm font-semibold text-black">
              PSU Triup Act
            </span>
          )}
        </div>

        {/* MENU SECTION */}
        <nav className="p-4 space-y-1">
          {open && (
            <div className="text-xs uppercase tracking-wide text-black/40 mb-2">
              Menu
            </div>
          )}

          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={closeOnMobile}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-all duration-150
                  ${
                    active
                      ? "bg-black/10 text-black shadow-sm"
                      : "text-black/60 hover:bg-black/5 hover:text-black"
                  }`}
              >
                <Icon className="h-5 w-5" />
                {open && label}
              </Link>
            );
          })}
        </nav>

        {/* ADMIN SECTION */}
        {roleReady && isAdmin() && (
          <nav className="p-4 space-y-1">
            {open && (
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">
                Admin
              </div>
            )}

            {links_admin.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeOnMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-all duration-150
                    ${
                      active
                        ? "bg-black/10 text-black shadow-sm"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {open && label}
                </Link>
              );
            })}
          </nav>
        )}
      </aside>

      {/* MOBILE OVERLAY */}
      {!desktop && open && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <div
        className={`flex-1 transition-all duration-300 ${
          open ? "lg:ml-72" : "lg:ml-16"
        }`}
      >
        <TopAppBar
          displayName={displayName}
          roleName={roleName}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
          router={router}
        />

        <main className="mx-auto">{children}</main>
      </div>
    </div>
  );
}
