"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DetailLayout({ children }) {
  const pathname = usePathname();

  return (
    <SidebarLayout>
      <div className="app-shell space-y-4 md:space-y-5">
        <section className="overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-r from-[#0b3a75] via-[#144d93] to-[#1f63af] px-5 py-5 text-white shadow-[0_12px_28px_rgba(12,63,127,0.18)] md:px-7 md:py-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-blue-100/95">
            TRIUP PSU
          </p>
          <h1 className="text-xl font-semibold leading-tight md:text-2xl">
            รายละเอียดแบบฟอร์มงานวิจัย
          </h1>
        </section>

        <nav className="section-card p-2.5 sm:p-3">
          <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 sm:flex-wrap sm:overflow-visible">
            <Tab href="owner" label="Owner" active={pathname?.endsWith("/owner")} />
            <Tab href="plan" label="Plan" active={pathname?.endsWith("/plan")} />
            <Tab href="utilization" label="Utilization" active={pathname?.endsWith("/utilization")} />
            <Tab href="extend" label="Extend" active={pathname?.endsWith("/extend")} />
          </div>
        </nav>

        <section className="section-card p-4 sm:p-5 md:p-6">{children}</section>
      </div>
    </SidebarLayout>
  );
}

function Tab({ href, label, active }) {
  return (
    <Link
      href={href}
      className={[
        "shrink-0 rounded-xl border px-3.5 py-2 text-sm font-medium transition sm:shrink",
        active
          ? "border-[#0b3a75] bg-[#0b3a75] text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
