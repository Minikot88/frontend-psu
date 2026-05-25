"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import useAdminGuard from "@/hooks/useAdminGuard";
import { authAdminFetch, clearAdminAuth } from "@/utils/auth-admin";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardBannerSettingsPage() {
  const allowed = useAdminGuard();
  const router = useRouter();
  const [title, setTitle] = useState("Dashboard Banner");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [banners, setBanners] = useState([]);
  const [logs, setLogs] = useState([]);

  const activeBanner = useMemo(
    () => banners.find((b) => b.is_active && !b.deleted_at) || null,
    [banners]
  );

  const handleAuthError = useCallback(
    (status) => {
      if (status === 401) {
        clearAdminAuth();
        router.replace("/admin/login-admin");
      }
    },
    [router]
  );

  const loadAll = useCallback(async () => {
    try {
      const [listRes, logRes] = await Promise.all([
        authAdminFetch(`${API}/api/dashboard-banner/admin/list`),
        authAdminFetch(`${API}/api/dashboard-banner/admin/logs`),
      ]);
      const [listJson, logJson] = await Promise.all([listRes.json(), logRes.json()]);
      setBanners(listJson?.data || []);
      setLogs(logJson?.data || []);
    } catch (e) {
      handleAuthError(e?.status);
      setError("ไม่สามารถโหลดข้อมูลการตั้งค่า Dashboard ได้");
    }
  }, [handleAuthError]);

  useEffect(() => {
    if (allowed) loadAll();
  }, [allowed, loadAll]);

  const uploadBanner = async () => {
    setError("");
    setSuccess("");
    if (!file) {
      setError("กรุณาเลือกไฟล์ .webp");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".webp") || file.type !== "image/webp") {
      setError("รองรับเฉพาะไฟล์ภาพ .webp เท่านั้น");
      return;
    }

    const form = new FormData();
    form.append("title", title || "Dashboard Banner");
    form.append("image", file);

    setLoading(true);
    try {
      const res = await authAdminFetch(`${API}/api/dashboard-banner/admin`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!json?.success) throw new Error("create failed");
      setSuccess("อัปโหลดภาพ Dashboard สำเร็จ");
      setFile(null);
      await loadAll();
    } catch (e) {
      handleAuthError(e?.status);
      setError("อัปโหลดภาพไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const setActive = async (banner_uuid) => {
    setError("");
    setSuccess("");
    try {
      await authAdminFetch(`${API}/api/dashboard-banner/admin/${banner_uuid}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: true }),
      });
      setSuccess("ตั้งค่าภาพที่ใช้งานเรียบร้อย");
      await loadAll();
    } catch (e) {
      handleAuthError(e?.status);
      setError("ตั้งค่าภาพไม่สำเร็จ");
    }
  };

  const removeBanner = async (banner_uuid) => {
    if (!confirm("ยืนยันการลบภาพ Dashboard นี้?")) return;
    setError("");
    setSuccess("");
    try {
      await authAdminFetch(`${API}/api/dashboard-banner/admin/${banner_uuid}`, {
        method: "DELETE",
      });
      setSuccess("ลบภาพเรียบร้อย");
      await loadAll();
    } catch (e) {
      handleAuthError(e?.status);
      setError("ลบภาพไม่สำเร็จ");
    }
  };

  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <section className="page-hero px-6 py-6">
          <h1 className="text-2xl font-semibold">ตั้งค่า Dashboard Banner</h1>
          <p className="mt-1 text-sm text-blue-100">อัปโหลดภาพ .webp และจัดการภาพหัว Dashboard</p>
        </section>

        <section className="section-card space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <label className="field-label">ชื่อภาพ</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dashboard Banner"
              />
            </div>
            <div>
              <label className="field-label">ไฟล์ภาพ (.webp เท่านั้น)</label>
              <input
                type="file"
                accept=".webp,image/webp"
                className="form-input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={uploadBanner} disabled={loading} className="btn-primary px-4 py-2 text-sm">
              {loading ? "กำลังอัปโหลด..." : "อัปโหลดภาพใหม่"}
            </button>
          </div>

          {activeBanner?.image_url && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
              <p className="mb-2 text-xs text-slate-600">ภาพที่ใช้งานอยู่</p>
              <img
                src={`${API}${activeBanner.image_url}`}
                alt={activeBanner.title || "Active banner"}
                className="h-auto w-full rounded-lg"
              />
            </div>
          )}

          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}
        </section>

        <section className="section-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">รายการภาพทั้งหมด</h2>
          <div className="table-wrap scrollbar-thin">
            <table className="data-table min-w-[840px]">
              <thead>
                <tr>
                  <th>ชื่อภาพ</th>
                  <th>สถานะ</th>
                  <th>แก้ไขล่าสุดโดย</th>
                  <th>เวลา</th>
                  <th className="text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500">
                      ยังไม่มีภาพ Dashboard
                    </td>
                  </tr>
                ) : (
                  banners.map((b) => (
                    <tr key={b.banner_uuid}>
                      <td>{b.title || "-"}</td>
                      <td>{b.is_active ? "ใช้งาน" : "ไม่ใช้งาน"}</td>
                      <td>{b.updated_by || "-"}</td>
                      <td>{b.updated_at ? new Date(b.updated_at).toLocaleString("th-TH") : "-"}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {!b.is_active && (
                            <button onClick={() => setActive(b.banner_uuid)} className="btn-secondary px-3 py-1.5 text-xs">
                              ตั้งเป็นภาพหลัก
                            </button>
                          )}
                          <button
                            onClick={() => removeBanner(b.banner_uuid)}
                            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-100"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">ประวัติการแก้ไข</h2>
          <div className="table-wrap scrollbar-thin">
            <table className="data-table min-w-[840px]">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>ผู้ดำเนินการ</th>
                  <th>Banner UUID</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-500">
                      ยังไม่มีประวัติการแก้ไข
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.log_uuid}>
                      <td>{log.action}</td>
                      <td>{log.actor || "-"}</td>
                      <td>{log.banner_uuid || "-"}</td>
                      <td>{log.created_at ? new Date(log.created_at).toLocaleString("th-TH") : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SidebarLayout>
  );
}
