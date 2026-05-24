"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchCheck, Home, ArrowLeft, GraduationCap } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-8">
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-100/75 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />

      <section className="section-card relative z-10 w-full max-w-2xl p-6 text-center sm:p-10">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold tracking-wide text-blue-800">
          <GraduationCap className="h-4 w-4" />
          PSU TRIUP ACT
        </div>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 sm:h-20 sm:w-20">
          <SearchCheck className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        <p className="text-6xl font-bold leading-none text-blue-900 sm:text-7xl">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="mt-3 text-base text-slate-700">
          ขออภัย ระบบไม่พบหน้าที่คุณพยายามเข้าถึง
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          ลิงก์อาจไม่ถูกต้อง หน้านี้อาจถูกย้าย หรือไม่มีอยู่ในระบบ
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm shadow-sm"
          >
            <Home className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
          <button
            type="button"
            onClick={handleBack}
            className="btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </button>
          <Link
            href="/user-psu/home"
            className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-800 hover:bg-blue-50"
          >
            ไปหน้าหลักผู้ใช้งาน
          </Link>
        </div>

        <p className="mt-7 text-xs text-slate-500 sm:text-sm">
          หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ
        </p>
      </section>
    </main>
  );
}
