"use client";

import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "url('/bg-psu-lines.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />

      <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <section className="section-card w-full max-w-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#0b3a75] to-[#1d5aa7] px-8 py-6 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-100">PSU TRIUP ACT</p>
            <h1 className="mt-2 text-2xl font-semibold">ระบบบริหารจัดการข้อมูล TRIUP Act</h1>
            <p className="mt-1 text-sm text-blue-100">เข้าสู่ระบบด้วย PSU One Passport</p>
          </div>

          <div className="space-y-6 px-8 py-8 sm:px-10">
            <div className="flex justify-center">
              <Image
                src="/psulogo.png"
                alt="Prince of Songkla University"
                width={116}
                height={116}
                priority
                className="drop-shadow-sm"
              />
            </div>

            <button
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/login`;
              }}
              className="btn-primary w-full px-4 py-3.5 text-sm shadow-md hover:shadow-lg"
            >
              เข้าสู่ระบบด้วย PSU One Passport
            </button>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              กรุณาเข้าสู่ระบบด้วยบัญชี PSU One Passport เพื่อใช้งานระบบ TRIUP PSU
            </div>

            <div className="text-center text-xs leading-relaxed text-slate-400">
              © {new Date().getFullYear()} ระบบบริหารจัดการข้อมูล TRIUP Act
              <br />
              Prince of Songkla University
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
