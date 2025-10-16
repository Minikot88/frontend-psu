"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { isAdmin, getRoleName, getSession } from "@/utils/role";
import { isAdminLoggedIn } from "@/utils/auth-admin";

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [fullname, setFullname] = useState("");
  const [roleName, setRoleName] = useState("");

  useEffect(() => {
    // ตรวจสิทธิ์ role PSU
    if (!isAdmin()) {
      router.replace("/403");
      return;
    }

    // ตรวจ admin login
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }

    // โหลดข้อมูลจาก localStorage
    const session = getSession();
    const _fullname =
      session?.profile?.fullname ||
      `${session?.profile?.first_name ?? ""} ${session?.profile?.last_name ?? ""}`.trim() ||
      session?.user?.username ||
      "Admin";

    setFullname(_fullname);
    setRoleName(session?.user?.role_name || "");

    setReady(true);
  }, []);

  // 🛑 สำคัญ: รอข้อมูลก่อน
  if (!ready) return null;

  return (
    <SidebarLayout>
      <div className="p-8 space-y-10">

        <header>
          <h1 className="text-4xl font-semibold tracking-tight">ระบบจัดการผู้ดูแลระบบ</h1>
          <p className="text-gray-600 mt-2">
            Welcome, <span className="font-medium">{fullname}</span> •{" "}
            <span className="text-blue-700 font-medium">{roleName}</span>
          </p>
        </header>

      </div>
    </SidebarLayout>
  );
}
