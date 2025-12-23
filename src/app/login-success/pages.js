"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get("session");
    if (session) {
      localStorage.setItem("psuSession", session);
      router.push("/user-psu/home");
    }
  }, [router]);

  return <div>กำลังเข้าสู่ระบบ...</div>;
}
