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

  // Multi Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const pageSize = 5;

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/api/master/form-new-findings`);
        const json = await res.json();
        if (json.success) setFindings(json.data || []);
        else throw new Error(json.error);
      } catch (err) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ================== Multi Filter ==================
  const filteredFindings = useMemo(() => {
    let data = findings;

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      data = data.filter((item) =>
        [
          item.report_code,
          item.report_title_th,
          item.report_title_en,
          item.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    return data;
  }, [findings, searchTerm, statusFilter]);

  // ================== Pagination ==================
  const totalPages = Math.max(
    1,
    Math.ceil(filteredFindings.length / pageSize)
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFindings.slice(start, start + pageSize);
  }, [filteredFindings, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  /** -----------------------------
   *  FIXED Pagination (No Duplication)
   *  ----------------------------- */
  const renderPaginationButtons = () => {
    const pages = [];

    // Helper: add page only once
    const addPage = (p) => {
      if (p >= 1 && p <= totalPages && !pages.includes(p)) {
        pages.push(p);
      }
    };

    // Always show first + last page
    addPage(1);
    addPage(currentPage - 1);
    addPage(currentPage);
    addPage(currentPage + 1);
    addPage(totalPages);

    // Sort
    pages.sort((a, b) => a - b);

    // Build final with "..."
    const final = [];
    let last = 0;

    pages.forEach((p) => {
      if (p - last > 1) final.push("...");
      final.push(p);
      last = p;
    });

    return final.map((p, index) =>
      p === "..." ? (
        <span key={index} className="px-2 text-[11px] text-black/40">...</span>
      ) : (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`px-2.5 py-1 text-[11px] rounded-full border min-w-[32px]
            ${
              currentPage === p
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white hover:bg-gray-100 border-black/10"
            }`}
        >
          {p}
        </button>
      )
    );
  };

  // ================== Export CSV ==================
  const exportCSV = () => {
    const rows = filteredFindings.map((item) => ({
      report_code: item.report_code,
      report_title_th: item.report_title_th,
      report_title_en: item.report_title_en,
      status: item.status,
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["Report Code", "Title TH", "Title EN", "Status"],
        ...rows.map((r) => [
          r.report_code,
          `"${(r.report_title_th || "").replace(/"/g, '""')}"`,
          `"${(r.report_title_en || "").replace(/"/g, '""')}"`,
          `"${(r.status || "").replace(/"/g, '""')}"`,
        ]),
      ]
        .map((e) => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "findings.csv";
    link.click();
  };

  // ================== Export Excel ==================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredFindings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Findings");
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/octet-stream",
      }),
      "findings.xlsx"
    );
  };

  // ================== Helper: Status Badge ==================
  const renderStatusBadge = (status) => {
    let colorClass =
      "bg-gray-100 text-gray-700 border border-gray-200";

    if (status?.includes("ยืนยันความถูกต้อง")) {
      colorClass =
        "bg-emerald-50 text-emerald-700 border border-emerald-100";
    } else if (status?.includes("รอตรวจสอบ")) {
      colorClass =
        "bg-amber-50 text-amber-700 border border-amber-100";
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${colorClass}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white shadow-lg flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              PSU Triup Act – หน้าหลัก
            </h1>
            <p className="text-xs text-white/80 mt-1">
              จัดการและติดตามรายงานผลงานวิจัยในระบบเดียว
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-black/5 bg-white/80 backdrop-blur shadow-sm px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="ค้นหา: รหัสรายงาน / ชื่อเรื่อง"
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-black/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="w-full md:w-60 px-3 py-1.5 text-xs border border-black/10 rounded-lg bg-white/80 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">📌 สถานะทั้งหมด</option>
              {[...new Set(findings.map((i) => i.status))].map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-full border border-black/10 bg-white hover:bg-gray-50 transition"
            >
              ⬇️ CSV
            </button>
            <button
              onClick={exportExcel}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
            >
              ⬇️ Excel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-black/60">
              กำลังโหลดข้อมูล...
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : filteredFindings.length === 0 ? (
            <div className="p-6 text-sm text-black/60">
              ไม่พบข้อมูลที่ตรงกับเงื่อนไขค้นหา
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-black/5">
                      <th className="px-4 py-2 text-left font-semibold text-black/70 whitespace-nowrap">
                        รหัสรายงาน
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-black/70">
                        ชื่อเรื่องผลงานวิจัย
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-black/70 hidden lg:table-cell">
                        ชื่อเรื่อง (EN)
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-black/70 whitespace-nowrap">
                        สถานะ
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-black/70 whitespace-nowrap">
                        การจัดการ
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.map((item, idx) => (
                      <tr
                        key={item.findings_pk_id}
                        className={`border-b border-black/5 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                        } hover:bg-blue-50/40`}
                      >
                        <td className="px-4 py-2 align-top whitespace-nowrap">
                          <div className="font-medium text-[11px] text-black/80">
                            {item.report_code}
                          </div>
                          <div className="text-[10px] text-black/40">
                            #{item.findings_pk_id}
                          </div>
                        </td>

                        <td className="px-4 py-2 align-top">
                          <div className="text-[11px] font-medium text-black/90 line-clamp-2">
                            {item.report_title_th}
                          </div>
                          <div className="mt-0.5 text-[10px] text-black/50 lg:hidden line-clamp-1">
                            {item.report_title_en}
                          </div>
                        </td>

                        <td className="px-4 py-2 align-top hidden lg:table-cell">
                          <div className="text-[11px] text-black/70 line-clamp-2">
                            {item.report_title_en}
                          </div>
                        </td>

                        <td className="px-4 py-2 align-top whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        <td className="px-4 py-2 align-top">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/home/detail/${item.findings_pk_id}`}
                              className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] px-2 py-1 transition"
                            >
                              ดูรายละเอียด
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

             
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
