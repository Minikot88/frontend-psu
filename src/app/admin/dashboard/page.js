"use client";

import { useEffect, useState } from "react";
import SidebarLayout from "@/components/SidebarLayout";
import { getSession } from "@/utils/role";
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
  const [ready, setReady] = useState(false);
  const [fullname, setFullname] = useState("");
  const [roleName, setRoleName] = useState("");

  const [usersStat, setUsersStat] = useState(null);
  const [findingsStat, setFindingsStat] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [yearly, setYearly] = useState([]);
  const [budget, setBudget] = useState([]);
  const [departmentStat, setDepartmentStat] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const session = getSession();

    const displayName =
      session?.profile?.fullname ||
      `${session?.profile?.first_name ?? ""} ${session?.profile?.last_name ?? ""}`.trim() ||
      session?.user?.username ||
      "User";

    setFullname(displayName);
    setRoleName(session?.user?.role_name || "");

    async function loadStatistics() {
      try {
        const u = await fetch(`${API}/api/statistics/users`).then((r) => r.json());
        const f = await fetch(`${API}/api/statistics/findings`).then((r) => r.json());
        const m = await fetch(`${API}/api/statistics/findings/monthly`).then((r) => r.json());
        const y = await fetch(`${API}/api/statistics/findings/yearly`).then((r) => r.json());
        const b = await fetch(`${API}/api/statistics/budget/year`).then((r) => r.json());
        const d = await fetch(`${API}/api/statistics/department`).then((r) => r.json());

        setUsersStat(u.data);
        setFindingsStat(f.data);
        setMonthly(m.data || []);
        setYearly(y.data || []);
        setBudget(b.data || []);
        setDepartmentStat(d.data || []);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStatistics();
    setReady(true);
  }, [API]);

  if (!ready) return null;

  const COLORS = ["#1d4f91", "#0f8a62", "#ec5f5f", "#f4a11f", "#6648cc"];

  return (
    <SidebarLayout>
      <div className="app-shell space-y-6">
        <section className="page-hero px-6 py-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-blue-100">
            Welcome, <span className="font-medium text-white">{fullname}</span>
            {roleName ? ` · ${roleName}` : ""}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="ผู้ใช้งานทั้งหมด" value={usersStat?.total_users || 0} tone="blue" />
          <Card title="ผลงานทั้งหมด" value={findingsStat?.total_findings || 0} tone="green" />
          <Card title="สถานะงาน" value={findingsStat?.findings_by_status?.length || 0} tone="orange" />
          <Card title="หน่วยงาน" value={departmentStat?.length || 0} tone="indigo" />
        </section>

        {loadingStats ? (
          <div className="state-box">กำลังโหลดข้อมูลแดชบอร์ด...</div>
        ) : (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <ChartCard title="ผู้ใช้ตามบทบาท">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={usersStat?.users_by_role || []}
                    dataKey="_count.roles_id"
                    nameKey="roles_name"
                    outerRadius={95}
                  >
                    {(usersStat?.users_by_role || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="ผลงานตามสถานะ">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={findingsStat?.findings_by_status || []}>
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="_count.status" fill="#1d5aa7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="แนวโน้มรายเดือน">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0f8a62" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="แนวโน้มรายปี">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearly}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6648cc" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="งบประมาณรายปี" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={budget}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="budget" stroke="#ec5f5f" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <a href={`${API}/api/statistics/export/excel`} className="btn-secondary px-4 py-2 text-sm">
            Export Excel
          </a>
          <a href={`${API}/api/statistics/export/pdf`} className="btn-primary px-4 py-2 text-sm">
            Export PDF
          </a>
        </div>
      </div>
    </SidebarLayout>
  );
}

function Card({ title, value, tone }) {
  const tones = {
    blue: "text-[#1d4f91]",
    green: "text-[#0f8a62]",
    orange: "text-[#f28b20]",
    indigo: "text-[#6648cc]",
  };

  return (
    <div className="section-card section-card-hover p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`section-card p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </div>
  );
}
