"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-8">
      <div className="absolute -left-24 -top-14 h-72 w-72 rounded-full bg-red-100/70 blur-3xl" />
      <div className="absolute -bottom-14 -right-20 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />

      <section className="section-card relative z-10 w-full max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <h1 className="text-5xl font-bold text-rose-600">403</h1>
        <p className="mt-3 text-lg font-medium text-slate-900">Access Forbidden</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาตรวจสอบสิทธิ์การใช้งานหรือติดต่อผู้ดูแลระบบ
        </p>

        <Link
          href="/"
          className="btn-primary mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  );
}

