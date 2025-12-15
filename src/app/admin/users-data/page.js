"use client";

import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { isAdmin, getSession } from "@/utils/role";
import { isAdminLoggedIn } from "@/utils/auth-admin";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const pageSize = 10;

  // Role Mapping + icon
  const roleMap = {
    1000: { name: "ผู้ดูแลระบบ", icon: "🔴" },
    2000: { name: "เจ้าหน้าที่วิจัย", icon: "🔵" },
    3000: { name: "ผู้ใช้งานทั่วไป", icon: "⚪" },
    4000: { name: "ผู้ร่วมวิจัยภายนอก", icon: "🟠" },
    5000: { name: "ผู้บ่มข้อมูล", icon: "🟢" },
    6000: { name: "อื่นๆ", icon: "🟣" },
  };

  // ⛔ ตรวจสิทธิ์ Admin + ตรวจ Login
  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/403");
      return;
    }

    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }
  }, []);

  // โหลดผู้ใช้
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;

    async function load() {
      try {
        const res = await fetch(`${API}/api/admin/users`);
        const json = await res.json();

        if (json.success) setUsers(json.data || []);
        else throw new Error(json.error);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // นับจำนวนผู้ใช้แต่ละ role
  const roleCount = users.reduce((acc, u) => {
    acc[u.roles_id] = (acc[u.roles_id] || 0) + 1;
    return acc;
  }, {});

  // Filter search + role
  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((u) => {
      const matchSearch = [
        u.username,
        u.profile?.fullname,
        roleMap[u.roles_id]?.name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      const matchRole =
        roleFilter === "all" || Number(roleFilter) === u.roles_id;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  // Render Pagination
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
        <span key={i} className="px-2 text-[11px] text-black/40">
          ...
        </span>
      ) : (
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`px-3 py-1 rounded-full text-[11px] border ${
            p === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white hover:bg-gray-100 border-black/20"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white shadow-lg">
          <h1 className="text-xl font-semibold">จัดการผู้ใช้งาน (Admin)</h1>
          <p className="text-xs text-white/80 mt-1">
            รายชื่อผู้ใช้ในระบบ และสิทธิ์การเข้าถึง (roles)
          </p>
        </div>

        {/* Search + Filter */}
        <div className="rounded-xl bg-white shadow border p-4 flex gap-4">
          <input
            type="text"
            placeholder="ค้นหา: username / ชื่อ / role"
            className="px-3 py-2 text-xs border rounded-lg w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="px-3 py-2 text-xs border rounded-lg w-60"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">📌 Role ทั้งหมด</option>

            {Object.entries(roleMap)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([id, role]) => (
                <option key={id} value={id}>
                  {role.icon} {role.name} ({roleCount[id] || 0})
                </option>
              ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-black/60">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="p-6 text-red-500 text-sm">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-sm text-black/60">ไม่พบข้อมูลที่ค้นหา</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-black/5">
                      <th className="px-4 py-2 text-left">Username</th>
                      <th className="px-4 py-2 text-left">ชื่อ - นามสกุล</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-right">การจัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((u, idx) => (
                      <tr
                        key={u.user_pk_uuid}
                        className={`border-b border-black/5 ${
                          idx % 2 ? "bg-gray-50/60" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-2">{u.username}</td>

                        <td className="px-4 py-2">
                          {u.profile?.fullname || "-"}
                        </td>

                        <td className="px-4 py-2">
                          {roleMap[u.roles_id]?.icon}{" "}
                          {roleMap[u.roles_id]?.name}
                        </td>

                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/admin/users-data/${u.user_pk_uuid}`}
                            className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-[11px]"
                          >
                            ดูรายละเอียด
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-center gap-2 py-4">
                {renderPagination()}
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
