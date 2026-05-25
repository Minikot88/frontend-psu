"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { authAdminFetch, clearAdminAuth } from "@/utils/auth-admin";
import { useRouter } from "next/navigation";

const roleMap = {
  900: { name: "CEO" },
  1000: { name: "ผู้ดูแลระบบ" },
  2000: { name: "เจ้าหน้าที่วิจัย" },
  3000: { name: "ผู้ใช้งานทั่วไป" },
  4000: { name: "ผู้ร่วมวิจัยภายนอก" },
  5000: { name: "ผู้ชมข้อมูล" },
  6000: { name: "อื่นๆ" },
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const pageSize = 10;

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;

    async function load() {
      try {
        const res = await authAdminFetch(`${apiBase}/api/admin/users`);
        const json = await res.json();

        if (json.success) setUsers(json.data || []);
        else throw new Error(json.error);
      } catch (err) {
        if (err?.status === 401) {
          clearAdminAuth();
          router.replace("/admin/login-admin");
          return;
        }
        setError(err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  const roleCount = users.reduce((acc, u) => {
    acc[u.roles_id] = (acc[u.roles_id] || 0) + 1;
    return acc;
  }, {});

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((u) => {
      const matchSearch = [u.username, u.profile?.fullname, roleMap[u.roles_id]?.name]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      const matchRole = roleFilter === "all" || Number(roleFilter) === u.roles_id;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const renderPagination = () => {
    const pages = [];
    const add = (p) => {
      if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
    };

    add(1);
    add(currentPage - 1);
    add(currentPage);
    add(currentPage + 1);
    add(totalPages);

    pages.sort((a, b) => a - b);

    const final = [];
    let last = 0;
    pages.forEach((p) => {
      if (p - last > 1) final.push("...");
      final.push(p);
      last = p;
    });

    return final.map((p, i) =>
      p === "..." ? (
        <span key={i} className="px-2 text-xs text-slate-400">
          …
        </span>
      ) : (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`rounded-lg border px-3 py-1 text-xs transition ${
            p === currentPage
              ? "border-[#0b3a75] bg-[#0b3a75] text-white"
              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <header className="page-hero px-6 py-6">
          <h1 className="text-2xl font-semibold">จัดการผู้ใช้งาน</h1>
          <p className="mt-1 text-sm text-blue-100">ตรวจสอบข้อมูลผู้ใช้และกำหนดสิทธิ์การใช้งานระบบ</p>
        </header>

        <section className="section-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <div>
                <label className="field-label" htmlFor="user-search">
                  ค้นหา
                </label>
                <input
                  id="user-search"
                  type="text"
                  placeholder="username / ชื่อ / role"
                  className="form-input"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="role-filter">
                  กรองตาม role
                </label>
                <select
                  id="role-filter"
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">Role ทั้งหมด</option>
                  {Object.entries(roleMap)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([id, role]) => (
                      <option key={id} value={id}>
                        {role.name} ({roleCount[id] || 0})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500">ทั้งหมด {filteredUsers.length} รายการ</div>
          </div>
        </section>

        <section className="section-card p-3 sm:p-4">
          {loading ? (
            <div className="state-box">กำลังโหลดข้อมูลผู้ใช้งาน...</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="state-box">ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา</div>
          ) : (
            <>
              <div className="table-wrap scrollbar-thin">
                <table className="data-table min-w-[780px]">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>ชื่อ - นามสกุล</th>
                      <th>Role</th>
                      <th className="text-right">รายละเอียด</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((u) => (
                      <tr key={u.user_pk_uuid}>
                        <td>{u.username || "-"}</td>
                        <td>{u.profile?.fullname || "-"}</td>
                        <td>
                          <span className="chip bg-blue-50 text-blue-800">{roleMap[u.roles_id]?.name || "-"}</span>
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/admin/users-data/${u.user_pk_uuid}`}
                            className="btn-secondary inline-flex px-3 py-1.5 text-xs"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end gap-2">{renderPagination()}</div>
            </>
          )}
        </section>
      </div>
    </SidebarLayout>
  );
}
