"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { isAdmin, getSession } from "@/utils/role";
import { isAdminLoggedIn } from "@/utils/auth-admin";

// CHARTS
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [fullname, setFullname] = useState("");
  const [roleName, setRoleName] = useState("");

  // 📊 STAT STATES
  const [usersStat, setUsersStat] = useState(null);
  const [findingsStat, setFindingsStat] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [budget, setBudget] = useState([]);
  const [departmentStat, setDepartmentStat] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/403");
      return;
    }

    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }

    const session = getSession();
    const _fullname =
      session?.profile?.fullname ||
      `${session?.profile?.first_name ?? ""} ${
        session?.profile?.last_name ?? ""
      }`.trim() ||
      session?.user?.username ||
      "Admin";

    setFullname(_fullname);
    setRoleName(session?.user?.role_name || "");

    // 🚀 โหลดข้อมูล Dashboard
    async function loadStatistics() {
      const u = await fetch(`${API}/api/statistics/users`).then((r) =>
        r.json()
      );
      const f = await fetch(`${API}/api/statistics/findings`).then((r) =>
        r.json()
      );
      const m = await fetch(`${API}/api/statistics/findings/monthly`).then(
        (r) => r.json()
      );
      const y = await fetch(`${API}/api/statistics/findings/yearly`).then((r) =>
        r.json()
      );
      const b = await fetch(`${API}/api/statistics/budget/year`).then((r) =>
        r.json()
      );
      const d = await fetch(`${API}/api/statistics/department`).then((r) =>
        r.json()
      );

      setUsersStat(u.data);
      setFindingsStat(f.data);
      setMonthly(m.data);
      setYearly(y.data);
      setBudget(b.data);
      setDepartmentStat(d.data);
    }

    loadStatistics();

    setReady(true);
  }, []);

  if (!ready) return null;

  const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#8E24AA", "#F4511E"];

  return (
    <SidebarLayout>
      <div className="p-8 space-y-10">
        {/* HEADER */}
        <header>
          <h1 className="text-4xl font-semibold tracking-tight">
            ระบบจัดการผู้ดูแลระบบ
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, <span className="font-medium">{fullname}</span> •{" "}
            <span className="text-blue-700 font-medium">{roleName}</span>
          </p>
        </header>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card title="ผู้ใช้ทั้งหมด" value={usersStat?.total_users || 0} />
          <Card
            title="ผลงานทั้งหมด"
            value={findingsStat?.total_findings || 0}
          />
          <Card
            title="จำนวนสถานะผลงาน"
            value={findingsStat?.findings_by_status?.length || 0}
          />
          <Card title="จำนวนภาควิชา" value={departmentStat?.length || 0} />
        </section>

        {/* CHART GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PIE CHART */}
          <ChartCard title="ผู้ใช้ตาม Role">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={usersStat?.users_by_role || []}
                  dataKey="_count.roles_id"
                  nameKey="roles_name"
                  outerRadius={100}
                  label
                >
                  {(usersStat?.users_by_role || []).map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* BAR CHART */}
          <ChartCard title="สถานะผลงานวิจัย">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={findingsStat?.findings_by_status || []}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="_count.status" fill="#1976D2" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* LINE CHART – MONTHLY */}
          <ChartCard title="จำนวนงานวิจัยรายเดือน (Line Chart)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#E53935"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* BAR CHART – YEAR */}
          <ChartCard title="จำนวนงานวิจัยรายปี">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearly}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8E24AA" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* BUDGET CHART */}
          <ChartCard title="งบประมาณรวมรายปี (Budget)">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={budget}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#43A047"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-3 mt-8">
          <a
            href={`${API}/api/statistics/export/excel`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ดาวน์โหลด Excel
          </a>
          <a
            href={`${API}/api/statistics/export/pdf`}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ดาวน์โหลด PDF
          </a>
        </div>
      </div>
    </SidebarLayout>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-white shadow border p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white shadow border p-6">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
