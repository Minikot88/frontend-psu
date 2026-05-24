"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/");
          return null;
        }
        if (!res.ok) {
          router.replace("/");
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (!data) {
    return (
      <SidebarLayout>
        <div className="state-box">กำลังโหลดข้อมูลโปรไฟล์...</div>
      </SidebarLayout>
    );
  }

  const { profile, role } = data;
  const roleName = role?.roles_name;

  return (
    <SidebarLayout>
      <div className="app-shell space-y-6 py-1">
        <section className="section-card overflow-hidden">
          <div className="bg-gradient-to-r from-[#0b3a75] to-[#1d5aa7] px-6 py-6 text-white">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
                {profile.first_name?.[0] || "U"}
              </div>

              <div>
                <h1 className="text-2xl font-semibold leading-tight">{profile.fullname || "-"}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-blue-100">
                  <span>{profile.position_th || "-"}</span>
                  {roleName && (
                    <span className="chip bg-white/20 text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {roleName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            <Section title="ข้อมูลส่วนตัว">
              <Row label="ชื่อ" value={profile.first_name} />
              <Row label="นามสกุล" value={profile.last_name} />
              <Row label="ชื่อ-นามสกุล" value={profile.fullname} />
              <Row label="อีเมล" value={profile.email} />
            </Section>

            <Section title="ข้อมูลบุคลากร">
              <Row label="รหัสบุคลากร" value={profile.staffid} />
              <Row label="ตำแหน่ง" value={profile.position_th} />
              <Row label="หน่วยงาน" value={profile.office_name_th} />
              <Row label="ภาควิชา" value={profile.department_name} />
              <Row label="วิทยาเขต" value={profile.campus_name} />
            </Section>

            <Section title="ข้อมูลบัญชี" className="md:col-span-2">
              <Row label="Username" value={profile.username} />
              <Row label="Role" value={roleName || "-"} />
            </Section>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}

function Section({ title, children, className = "" }) {
  return (
    <section className={`section-card rounded-xl border border-slate-200 bg-white p-4 shadow-none ${className}`}>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg px-2 py-1.5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="col-span-2 text-sm font-medium text-slate-800 break-words">{value || "-"}</p>
    </div>
  );
}
