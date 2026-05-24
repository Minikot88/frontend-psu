"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    if (!email?.trim() || !password?.trim()) {
      setMsg("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost("/api/login-api-triup/login", {
        email,
        password,
      });

      const token = res?.session?.id;
      const expISO = res?.session?.expiresAt;

      if (res?.success && token && expISO) {
        const expMs = new Date(expISO).getTime();
        localStorage.setItem("token", token);
        localStorage.setItem("token_exp", String(expMs));
        document.cookie = `admin_session=${encodeURIComponent(
          token
        )}; Path=/; SameSite=Lax; Expires=${new Date(expMs).toUTCString()}`;

        router.replace("/admin/dashboard");
      } else {
        setMsg(res?.error || "Invalid email or password");
      }
    } catch (err) {
      const errorText = String(err?.message || "").toLowerCase();
      if (errorText.includes("invalid credentials") || errorText.includes("login failed")) {
        setMsg("Invalid email or password");
      } else {
        setMsg(err?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg items-center justify-center">
        <section className="section-card w-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#7e0b17] to-[#b42318] px-8 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">ADMIN PANEL</p>
            <h1 className="mt-2 text-2xl font-semibold">Administrator Sign In</h1>
            <p className="mt-1 text-sm text-rose-100">Sign in to manage TRIUP PSU administration</p>
          </div>

          <div className="space-y-6 px-8 py-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="field-label" htmlFor="admin-email">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@psu.ac.th"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="admin-password">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-danger w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {msg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {msg}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              This page is restricted to authorized administrators only.
            </div>

            <div className="text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Prince of Songkla University
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
