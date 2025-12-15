"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params?.uuid;

  const [user, setUser] = useState(null);
  const [rolesId, setRolesId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleMap = {
    1000: "ผู้ดูแลระบบ",
    2000: "เจ้าหน้าที่วิจัย",
    3000: "ผู้ใช้งานทั่วไป",
    4000: "ผู้ร่วมวิจัยภายนอก",
    5000: "ผู้บ่มข้อมูล",
    6000: "อื่นๆ",
  };

  // 🟦 ฟังก์ชันดึงชื่อ Admin จาก session (ป้องกัน unknown)
  const getActiveAdmin = () => {
    try {
      const session = JSON.parse(localStorage.getItem("admin_session")) || {};

      return (
        session?.user?.username ||
        session?.profile?.username ||
        session?.admin?.username ||
        session?.username ||
        `${session?.profile?.first_name ?? ""} ${session?.profile?.last_name ?? ""}`.trim() ||
        "unknown"
      );
    } catch (e) {
      return "unknown";
    }
  };

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    if (!uuid) return;

    async function load() {
      try {
        const res = await fetch(`${API}/api/admin/users/${uuid}`);
        const json = await res.json();

        setUser(json.data);
        setRolesId(json.data.roles_id);

        // โหลด Log การเปลี่ยน Role
        const logRes = await fetch(`${API}/api/admin/users/${uuid}/role-log`);
        const logJson = await logRes.json();
        setLogs(logJson.data);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [uuid]);

 const updateRole = async () => {
  const API = process.env.NEXT_PUBLIC_API_URL;

  // ⭐ ใช้ชื่อผู้ใช้ที่แสดงบนหน้าจอ
  const changedBy = user?.username || "unknown";

  const confirm = await Swal.fire({
    title: "ยืนยันการเปลี่ยน Role?",
    text: "คุณต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });

  if (!confirm.isConfirmed) return;

  await fetch(`${API}/api/admin/users/${uuid}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roles_id: rolesId,
      changed_by: changedBy,  // ⭐ ส่ง user.username
    }),
  });

  Swal.fire({
    icon: "success",
    title: "บันทึกสำเร็จ",
    timer: 1500,
    showConfirmButton: false,
  });

  setTimeout(() => window.location.reload(), 1200);
};


  if (loading)
    return (
      <SidebarLayout>
        <div className="p-6 text-sm text-black/60">กำลังโหลดข้อมูล...</div>
      </SidebarLayout>
    );

  if (!user)
    return (
      <SidebarLayout>
        <div className="p-6 text-red-500 text-sm">ไม่พบข้อมูลผู้ใช้</div>
      </SidebarLayout>
    );

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white shadow-lg">
          <h1 className="text-xl font-semibold">ข้อมูลผู้ใช้ : {user.username}</h1>
          <p className="text-xs text-white/80">รายละเอียดและสิทธิ์การเข้าถึง</p>
        </div>

        {/* Login Info */}
        <div className="rounded-2xl bg-white shadow border p-6 space-y-2">
          <h2 className="text-sm font-semibold">ข้อมูล Login</h2>
          <p className="text-xs"><b>Username:</b> {user.username}</p>
          <p className="text-xs">
            <b>Token:</b> <span className="text-blue-600 break-all">{user.token}</span>
          </p>
          <p className="text-xs">
            <b>Current Role:</b>{" "}
            <span className="text-emerald-600 font-semibold">{roleMap[user.roles_id]}</span>
          </p>
        </div>

        {/* Profile */}
        <div className="rounded-2xl bg-white shadow border p-6">
          <h2 className="text-sm font-semibold">ข้อมูล Profile</h2>
          <pre className="text-xs mt-3 p-3 bg-gray-50 rounded-xl border overflow-auto">
            {JSON.stringify(user.profile, null, 2)}
          </pre>
        </div>

        {/* Update Role */}
        <div className="rounded-2xl bg-white shadow border p-6 space-y-4">
          <h2 className="text-sm font-semibold">แก้ไขสิทธิ์ (Role)</h2>

          <select
            className="px-3 py-2 text-xs border rounded-lg bg-white w-60"
            value={rolesId}
            onChange={(e) => setRolesId(e.target.value)}
          >
            {Object.keys(roleMap).map((key) => (
              <option key={key} value={key}>
                {roleMap[key]}
              </option>
            ))}
          </select>

          <div className="flex gap-4 pt-3">
            <button
              onClick={updateRole}
              className="px-5 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              บันทึกการเปลี่ยนแปลง
            </button>

            <button
              onClick={() => router.back()}
              className="px-5 py-2 text-xs border rounded-lg hover:bg-gray-50"
            >
              กลับ
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="rounded-2xl bg-white shadow border p-6">
          <h2 className="text-sm font-semibold mb-3">ประวัติการเปลี่ยนสิทธิ์</h2>

          <table className="w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">เดิม</th>
                <th className="p-2 border">ใหม่</th>
                <th className="p-2 border">โดย</th>
                <th className="p-2 border">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.log_id}>
                  <td className="p-2 border">{item.old_role_name}</td>
                  <td className="p-2 border text-blue-600">{item.new_role_name}</td>
                  <td className="p-2 border">{item.changed_by}</td>
                  <td className="p-2 border">
                    {new Date(item.changed_at).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </SidebarLayout>
  );
}
