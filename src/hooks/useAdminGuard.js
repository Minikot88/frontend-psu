"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAdminAuth, getAdminToken } from "@/utils/auth-admin";

export default function useAdminGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      clearAdminAuth();
      router.replace("/admin/login-admin");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login-api-triup/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          clearAdminAuth();
          router.replace("/admin/login-admin");
          return;
        }
        if (!res.ok) {
          clearAdminAuth();
          router.replace("/admin/login-admin");
          return;
        }

        const data = await res.json();

        const roleId =
          data?.user?.roles_id ??
          data?.session?.roles_id ??
          data?.role?.roles_id;

        if (![900, 1000].includes(Number(roleId))) {
          router.replace("/user-psu/home");
          return;
        }

        setAllowed(true);
      })
      .catch(() => {
        clearAdminAuth();
        router.replace("/admin/login-admin");
      });
  }, [router]);

  return allowed;
}
