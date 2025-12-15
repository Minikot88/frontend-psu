"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminLoggedIn } from "@/utils/auth-admin";

export default function useAdminGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // ถ้ายังไม่ login → redirect ไปหน้า login
    if (!isAdminLoggedIn()) {
      router.replace("/admin/login-admin");
      return;
    }

    setAllowed(true);
  }, []);

  return allowed;
}
