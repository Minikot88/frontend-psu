"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function AdminHome() {
  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <section className="page-hero px-6 py-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-blue-100">Welcome back! Here is an overview of your system.</p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="section-card section-card-hover p-5">
            <h2 className="text-base font-semibold text-slate-900">Overview</h2>
            <p className="mt-2 text-sm text-slate-600">ตรวจสอบภาพรวมข้อมูลล่าสุดและสถานะการใช้งานระบบ</p>
          </div>

          <div className="section-card section-card-hover p-5">
            <h2 className="text-base font-semibold text-slate-900">Update</h2>
            <p className="mt-2 text-sm text-slate-600">ติดตามงานที่ต้องดำเนินการและอัปเดตข้อมูลสำคัญ</p>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Prince of Songkla University
        </footer>
      </div>
    </SidebarLayout>
  );
}
