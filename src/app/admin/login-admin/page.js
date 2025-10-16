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
      setMsg("กรอกอีเมล/รหัสผ่านก่อน");
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

        router.replace("/admin/dashboard");
      } else {
        setMsg(res?.error || "username หรือ password ไม่ถูกต้อง");
      }
    } catch (err) {
      setMsg(err?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(135deg, #D3D5DCFF 0%, #C50A0AFF 100%)",
      }}
    >
      <div className="flex w-full max-w-5xl min-h-[420px] bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        <div
          className="hidden md:flex flex-col justify-center p-12 w-1/2"
          style={{
            background: "linear-gradient(135deg, #CB1111FF, #6571F0FF)",
            color: "white",
          }}
        >
          <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
            ฮั่นแน่ admin เหรออ!?
          </h2>
        </div>

        <div className="flex flex-col justify-center p-10 w-full md:w-1/2 bg-white">
          <h1 className="text-sm font-semibold text-center tracking-[0.2em] text-[#FE0505FF]">
            LOGIN ADMIN
          </h1>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="อีเมลหนะ"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#CB1111FF] focus:outline-none text-sm"
            />

            <input
              type="password"
              placeholder="รหัสสๆๆๆ"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#CB1111FF] focus:outline-none text-sm"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 rounded-xl text-white font-semibold shadow-lg transition text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #E36262FF 0%, #4A77D9FF 100%)",
              }}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "GOOO"}
            </button>
          </form>

          {msg && (
            <div className="mt-4 text-center text-sm text-red-600">{msg}</div>
          )}
        </div>
      </div>

      <footer className="absolute bottom-4 text-white/80 text-xs text-center">
        © {new Date().getFullYear()} Prince of Songkla University
      </footer>
    </main>
  );
}
