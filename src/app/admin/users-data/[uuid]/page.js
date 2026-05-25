"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { User, Building2, Briefcase, Shield, ArrowLeft } from "lucide-react";
import { authAdminFetch, clearAdminAuth, getAdminToken } from "@/utils/auth-admin";

const roleMap = {
  900: "CEO",
  1000: "ผู้ดูแลระบบ",
  2000: "เจ้าหน้าที่วิจัย",
  3000: "ผู้ใช้งานทั่วไป",
  4000: "ผู้ร่วมวิจัยภายนอก",
  5000: "ผู้ชมข้อมูล",
  6000: "อื่นๆ",
};

function Section({ title, children, className = "" }) {
  return (
    <section className={`section-card p-5 ${className}`}>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />}
      <div className="flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="break-words text-sm font-medium text-slate-800">{value || "-"}</div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const { uuid } = useParams();

  const [user, setUser] = useState(null);
  const [rolesId, setRolesId] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const getActiveAdmin = () => {
    try {
      const session = JSON.parse(localStorage.getItem("admin_profile")) || {};
      return (
        session?.user?.username ||
        session?.profile?.username ||
        session?.admin?.username ||
        session?.username ||
        `${session?.profile?.first_name ?? ""} ${session?.profile?.last_name ?? ""}`.trim() ||
        "ผู้ดูแลระบบ"
      );
    } catch {
      return "ผู้ดูแลระบบ";
    }
  };

  const load = useCallback(async () => {
    try {
      const res = await authAdminFetch(`${API}/api/admin/users/${uuid}`);
      const json = await res.json();

      setUser(json.data);
      setRolesId(Number(json.data.roles_id));

      const logRes = await authAdminFetch(`${API}/api/admin/users/${uuid}/role-log`);
      const logJson = await logRes.json();
      setLogs(logJson.data || []);
    } catch (err) {
      if (err?.status === 401) {
        clearAdminAuth();
        router.replace("/admin/login-admin");
        return;
      }
      if (err?.status === 403) {
        Swal.fire("ไม่มีสิทธิ์เข้าถึง", "บัญชีนี้ไม่มีสิทธิ์สำหรับหน้านี้", "error");
        router.replace("/user-psu/home");
        return;
      }
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้", "error");
    } finally {
      setLoading(false);
    }
  }, [API, router, uuid]);

  useEffect(() => {
    if (!getAdminToken()) {
      clearAdminAuth();
      router.replace("/admin/login-admin");
      return;
    }
    if (uuid) load();
  }, [load, router, uuid]);

  const updateRole = async () => {
    const changedBy = getActiveAdmin();

    const confirm = await Swal.fire({
      title: "ยืนยันการเปลี่ยน Role?",
      text: "คุณต้องการอัปเดตสิทธิ์ผู้ใช้นี้ใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await authAdminFetch(`${API}/api/admin/users/${uuid}/role`, {
        method: "PUT",
        body: JSON.stringify({
          roles_id: rolesId,
          changed_by: changedBy,
        }),
      });

      Swal.fire({
        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1200,
        showConfirmButton: false,
      });

      load();
    } catch (err) {
      if (err?.status === 401) {
        clearAdminAuth();
        router.replace("/admin/login-admin");
        return;
      }
      if (err?.status === 403) {
        Swal.fire("ไม่มีสิทธิ์ดำเนินการ", "อนุญาตเฉพาะผู้ดูแลระบบเท่านั้น", "error");
        return;
      }
      Swal.fire("ไม่สำเร็จ", "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้งานได้", "error");
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="state-box">กำลังโหลดข้อมูล...</div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          ไม่พบข้อมูลผู้ใช้งาน
        </div>
      </SidebarLayout>
    );
  }

  const profile = user.profile || {};

  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <button
          onClick={() => router.push("/admin/users-data")}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าผู้ใช้งาน
        </button>

        <section className="section-card overflow-hidden">
          <div className="bg-gradient-to-r from-[#0b3a75] to-[#1d5aa7] px-6 py-6 text-white">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
                {profile.first_name?.[0] || user.username?.[0] || "U"}
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-semibold">{profile.fullname || "-"}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-blue-100">
                  <span>{profile.position_th || "-"}</span>
                  <span className="chip bg-white/20 text-white">{roleMap[user.roles_id]}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
            <Section title="ข้อมูลส่วนตัว">
              <Row icon={User} label="ชื่อ" value={profile.first_name} />
              <Row icon={User} label="นามสกุล" value={profile.last_name} />
              <Row icon={User} label="ชื่อ-นามสกุล" value={profile.fullname} />
              <Row icon={User} label="อีเมล" value={profile.email} />
            </Section>

            <Section title="ข้อมูลบุคลากร">
              <Row icon={Briefcase} label="รหัสบุคลากร" value={profile.staffid} />
              <Row icon={Briefcase} label="ตำแหน่ง" value={profile.position_th} />
              <Row icon={Building2} label="หน่วยงาน" value={profile.office_name_th} />
              <Row icon={Building2} label="ภาควิชา" value={profile.department_name} />
              <Row icon={Building2} label="วิทยาเขต" value={profile.campus_name} />
            </Section>

            <Section title="ข้อมูลบัญชี" className="lg:col-span-2">
              <Row label="Username" value={user.username} />
              <Row icon={Shield} label="Role" value={roleMap[user.roles_id]} />
            </Section>

            <Section title="จัดการสิทธิ์" className="lg:col-span-2">
              {user.roles_id === 900 && (
                <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  CEO เป็นสิทธิ์พิเศษและไม่สามารถแก้ไขได้
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <select
                  disabled={user.roles_id === 900}
                  className="form-select max-w-xs"
                  value={rolesId}
                  onChange={(e) => setRolesId(Number(e.target.value))}
                >
                  {Object.entries(roleMap)
                    .filter(([k]) => Number(k) !== 900)
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>

                <button
                  disabled={user.roles_id === 900}
                  onClick={updateRole}
                  className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  บันทึก
                </button>
              </div>
            </Section>

            <Section title="ประวัติการเปลี่ยนสิทธิ์" className="lg:col-span-2">
              <div className="table-wrap scrollbar-thin">
                <table className="data-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>จาก</th>
                      <th>เป็น</th>
                      <th>โดย</th>
                      <th>เวลา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-sm text-slate-500">
                          ยังไม่มีประวัติการเปลี่ยนสิทธิ์
                        </td>
                      </tr>
                    ) : (
                      logs.map((l) => (
                        <tr key={l.log_id}>
                          <td>{l.old_role_name}</td>
                          <td className="font-medium text-blue-700">{l.new_role_name}</td>
                          <td>{l.changed_by || "ผู้ดูแลระบบ"}</td>
                          <td>{new Date(l.changed_at).toLocaleString("th-TH")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}

