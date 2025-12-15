"use client";

import SidebarLayout from "@/components/SidebarLayout";
import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function HomePage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const pageSize = 5;

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

    let result = [],
      last = 0;

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

    const csv = [
      ["Report Code", "Title TH", "Title EN", "Status"],
      ...rows.map((r) => [
        r.report_code,
        `"${r.report_title_th?.replace(/"/g, '""')}"`,
        `"${r.report_title_en?.replace(/"/g, '""')}"`,
        `"${r.status?.replace(/"/g, '""')}"`,
      ]),
    ]
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
    const style = status.includes("ยืนยัน")
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : status.includes("รอตรวจ")
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border line-clamp-1 cursor-help ${style}`}
        title={status}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-white shadow-lg">
          <h1 className="text-xl font-semibold">PSU Triup Act – หน้าหลัก</h1>
          <p className="text-xs text-white/80 mt-1">
            จัดการและติดตามรายงานผลงานวิจัยในระบบเดียว
          </p>
        </div>

        {/* Filter */}
        <div className="rounded-2xl border bg-white/80 backdrop-blur px-4 py-3 shadow-sm flex flex-col gap-3 md:flex-row md:justify-between">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="w-full md:w-72 pl-7 pr-3 py-1.5 text-xs border rounded-lg"
              placeholder="ค้นหา: รหัสรายงาน / ชื่อเรื่อง"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="w-full md:w-60 px-3 py-1.5 text-xs border rounded-lg"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">📌 สถานะทั้งหมด</option>
              {[...new Set(findings.map((i) => i.status))].map((st) => (
                <option key={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={exportCSV} className="px-3 py-1.5 text-[11px] rounded-full border">
              ⬇️ CSV
            </button>
            <button
              onClick={exportExcel}
              className="px-3 py-1.5 text-[11px] rounded-full border bg-emerald-50 text-emerald-700"
            >
              ⬇️ Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-black/60">กำลังโหลดข้อมูล...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-sm text-black/60">ไม่พบข้อมูล</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-2 text-left">รหัสรายงาน</th>
                      <th className="px-4 py-2 text-left">ชื่อเรื่อง (TH)</th>
                      <th className="px-4 py-2 text-left hidden lg:table-cell">
                        ชื่อเรื่อง (EN)
                      </th>
                      <th className="px-4 py-2 text-left">สถานะ</th>
                      <th className="px-4 py-2 text-right">การจัดการ</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((i) => (
                      <tr key={i.findings_pk_id} className="border-b hover:bg-blue-50/40">
                        <td className="px-4 py-2">
                          <div className="font-medium">{i.report_code}</div>
                          <div className="text-[10px] text-black/40">#{i.findings_pk_id}</div>
                        </td>

                        <td className="px-4 py-2 max-w-[240px]">
                          <div
                            className="line-clamp-1 text-[11px] font-medium cursor-help"
                            title={i.report_title_th}
                          >
                            {i.report_title_th}
                          </div>
                        </td>

                        <td className="px-4 py-2 hidden lg:table-cell max-w-[240px]">
                          <div className="line-clamp-1 cursor-help" title={i.report_title_en}>
                            {i.report_title_en}
                          </div>
                        </td>

                        <td className="px-4 py-2 max-w-[180px]">
                          <StatusBadge status={i.status} />
                        </td>

                        <td className="px-4 py-2 text-right">
                          <a
                            href={`/home/detail/${i.findings_pk_id}`}
                            className="p-2 text-blue-600 hover:text-blue-800"
                            title="ดูรายละเอียด"
                          >
                            🔍
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {/* Pagination */}
<div className="flex justify-end py-3 pr-4">
  <div className="flex items-center gap-1">

    {/* Previous */}
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
      className={`px-3 py-1 text-[11px] rounded-full border 
        ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}
      `}
    >
      ก่อนหน้า
    </button>

    {/* Page numbers */}
    {pages.map((p, idx) =>
      p === "..." ? (
        <span key={`ellipsis-${idx}`} className="px-2">...</span>
      ) : (
        <button
          key={`page-${p}`}
          onClick={() => setCurrentPage(p)}
          className={`px-2 py-1 text-[11px] rounded-full border 
            ${currentPage === p ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}
          `}
        >
          {p}
        </button>
      )
    )}

    {/* Next */}
    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      className={`px-3 py-1 text-[11px] rounded-full border 
        ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"}
      `}
    >
      ถัดไป
    </button>

  </div>
</div>

            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
