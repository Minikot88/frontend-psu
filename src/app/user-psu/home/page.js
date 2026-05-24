"use client";

import SidebarLayout from "@/components/SidebarLayout";
import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();
  const pageSize = 15;

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/master/form-new-findings`)
      .then((res) => res.json())
      .then((json) => (json.success ? setFindings(json.data) : setError(json.error)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return findings
      .filter((i) =>
        [i.report_code, i.report_title_th, i.report_title_en, i.status]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .filter((i) => (statusFilter === "all" ? true : i.status === statusFilter));
  }, [findings, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const pages = useMemo(() => {
    const setPages = new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]);
    const arr = [...setPages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

    const result = [];
    let last = 0;
    arr.forEach((p) => {
      if (p - last > 1) result.push("...");
      result.push(p);
      last = p;
    });
    return result;
  }, [currentPage, totalPages]);

  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      report_code: r.report_code,
      report_title_th: r.report_title_th,
      report_title_en: r.report_title_en,
      status: r.status,
    }));

    const csv = [["Report Code", "Title TH", "Title EN", "Status"], ...rows.map((r) => [
      r.report_code,
      `"${r.report_title_th ?? ""}"`,
      `"${r.report_title_en ?? ""}"`,
      `"${r.status ?? ""}"`,
    ])]
      .map((e) => e.join(","))
      .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    link.download = "findings.csv";
    link.click();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Findings");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "findings.xlsx");
  };

  const StatusBadge = ({ status }) => {
    const style = status?.includes("อนุมัติ")
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status?.includes("รอดำเนินการ")
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

    return (
      <span className={`chip border ${style}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <section className="page-hero px-6 py-6">
          <h1 className="text-2xl font-semibold">PSU TRIUP ACT</h1>
          <p className="mt-1 text-sm text-blue-100">รายการผลงานวิจัยและสถานะการรายงาน TRIUP</p>
        </section>

        <section className="section-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <div>
                <label className="field-label" htmlFor="finding-search">
                  ค้นหา
                </label>
                <input
                  id="finding-search"
                  className="form-input"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="field-label" htmlFor="status-filter">
                  สถานะ
                </label>
                <select
                  id="status-filter"
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">สถานะทั้งหมด</option>
                  {[...new Set(findings.map((i) => i.status))].map((st) => (
                    <option key={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={exportCSV} className="btn-secondary px-3 py-2 text-xs">
                Export CSV
              </button>
              <button onClick={exportExcel} className="btn-primary px-3 py-2 text-xs">
                Export Excel
              </button>
            </div>
          </div>
        </section>

        <section className="section-card p-3 sm:p-4">
          {loading ? (
            <div className="state-box">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="state-box">ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา</div>
          ) : (
            <>
              <div className="table-wrap scrollbar-thin">
                <table className="data-table min-w-[920px]">
                  <thead>
                    <tr>
                      <th>รหัสรายงาน</th>
                      <th>ชื่อรายงาน (TH)</th>
                      <th className="hidden lg:table-cell">ชื่อรายงาน (EN)</th>
                      <th>สถานะ</th>
                      <th className="text-center">รายละเอียด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((i) => (
                      <tr key={i.findings_pk_id}>
                        <td>{i.report_code}</td>
                        <td className="max-w-[360px] truncate">{i.report_title_th}</td>
                        <td className="hidden max-w-[260px] truncate lg:table-cell">{i.report_title_en}</td>
                        <td>
                          <StatusBadge status={i.status} />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => router.push(`/user-psu/home/detail/${i.form_new_id}/owner`)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-[#0b3a75] hover:bg-slate-100"
                          >
                            <Search size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {pages.map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="px-2 text-xs text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(p)}
                      className={`rounded-lg border px-3 py-1 text-xs ${
                        p === currentPage
                          ? "border-[#0b3a75] bg-[#0b3a75] text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </SidebarLayout>
  );
}
