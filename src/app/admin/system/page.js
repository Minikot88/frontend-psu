"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAdminFetch, clearAdminAuth, getAdminToken } from "@/utils/auth-admin";

export default function UsersPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [fetchOpen, setFetchOpen] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingImportForm, setLoadingImportForm] = useState(false);
  const [loadingImportUser, setLoadingImportUser] = useState(false);

  const [importFixResult, setImportFixResult] = useState(null);
  const [data, setData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importUserResult, setImportUserResult] = useState(null);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkSession = async () => {
      const token = getAdminToken();
      if (!token) {
        clearAdminAuth();
        router.replace("/admin/login-admin");
        return;
      }

      try {
        await authAdminFetch(`${API}/api/login-api-triup/me`);

        setChecking(false);
      } catch {
        clearAdminAuth();
        router.replace("/admin/login-admin");
      }
    };

    checkSession();
  }, [API, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="state-box">Checking session...</div>
      </div>
    );
  }

  const logout = async () => {
    const token = getAdminToken();

    try {
      if (token) {
        await fetch(`${API}/api/login-api-triup/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (e) {
    } finally {
      clearAdminAuth();

      router.replace("/user-psu/home");
    }
  };

  const handleToggle = () => {
    if (fetchOpen) {
      logout();
    } else {
      fetchAll();
    }
  };

  const fetchAll = async () => {
    if (fetchOpen) {
      setFetchOpen(false);
      return;
    }

    setLoadingFetch(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`${API}/api/scripts/fetch-all`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fetch failed");

      setData(json);
      setFetchOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingFetch(false);
    }
  };

  const importServerFix = async () => {
    setLoadingImport(true);
    setError("");
    setImportFixResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-fix`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setImportFixResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImport(false);
    }
  };

  const importServerForm = async () => {
    setLoadingImportForm(true);
    setError("");
    setImportResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-form`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setImportResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImportForm(false);
    }
  };

  const importServerUser = async () => {
    setLoadingImportUser(true);
    setError("");
    setImportUserResult(null);

    try {
      const res = await fetch(`${API}/api/scripts/import-server-user`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");
      setImportUserResult(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingImportUser(false);
    }
  };

  const importAll = async () => {
    await Promise.all([importServerFix(), importServerForm(), importServerUser()]);
  };

  return (
    <SidebarLayout>
      <div className="app-shell space-y-5">
        <section className="page-hero px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">TRIUP Admin Console</h1>
              <p className="mt-1 text-sm text-blue-100">จัดการการดึงและนำเข้าข้อมูลสำหรับระบบ TRIUP</p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-4 py-2">
              <span className="text-sm">{loadingFetch ? "Loading..." : fetchOpen ? "เปิด" : "ปิด"}</span>

              <input
                type="checkbox"
                className="peer sr-only"
                checked={fetchOpen}
                onChange={handleToggle}
                disabled={loadingFetch}
              />

              <div className="relative h-7 w-14 rounded-full bg-rose-500 transition peer-checked:bg-emerald-500">
                <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-7" />
              </div>
            </label>
          </div>
        </section>

        {fetchOpen && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ActionCard title="TRIUP Import" onClick={importServerFix} loading={loadingImport} />
            <ActionCard title="Import Server Form" onClick={importServerForm} loading={loadingImportForm} />
            <ActionCard title="Import Server User" onClick={importServerUser} loading={loadingImportUser} />
            <ActionCard title="Import All" onClick={importAll} highlight />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="space-y-4">
          {data?.items && (
            <ResultCard title="ผลการตรวจสอบข้อมูลจากระบบต้นทาง">
              {(() => {
                const errors = data.items.filter((item) => item.status !== "ok");

                if (errors.length === 0) {
                  return (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      ดึงข้อมูลจากต้นทางสำเร็จทั้งหมด
                      <div className="mt-1 text-xs text-slate-500">Fetched at: {data.fetchedAt}</div>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      พบข้อผิดพลาด {errors.length} รายการ
                    </div>

                    <div className="table-wrap scrollbar-thin">
                      <table className="data-table min-w-[760px]">
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Status</th>
                            <th>Path / Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errors.map((item) => (
                            <tr key={item.key}>
                              <td>{item.key}</td>
                              <td className="font-medium text-rose-700">Error</td>
                              <td className="break-all">{item.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-2 text-right text-xs text-slate-500">Fetched at: {data.fetchedAt}</div>
                  </>
                );
              })()}
            </ResultCard>
          )}

          {importFixResult?.counts && <ImportResultCard title="TRIUP Import Results" counts={importFixResult.counts} />}
          {importResult?.counts && <ImportResultCard title="Server Form Import Results" counts={importResult.counts} />}
          {importUserResult?.counts && (
            <ImportResultCard title="Users & Researchers Import Results" counts={importUserResult.counts} />
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

function ActionCard({ title, onClick, loading, highlight }) {
  return (
    <div className={`section-card p-5 ${highlight ? "bg-blue-50" : ""}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <button
        onClick={onClick}
        disabled={loading}
        className="btn-primary w-full px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Running..." : "Run"}
      </button>
    </div>
  );
}

function ResultCard({ title, children }) {
  return (
    <div className="section-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function ImportResultCard({ title, counts }) {
  return (
    <ResultCard title={title}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{key}</div>
            <div className="mt-1 text-xl font-semibold text-[#0b3a75]">{value}</div>
          </div>
        ))}
      </div>
    </ResultCard>
  );
}
