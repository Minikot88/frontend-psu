"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAdminGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/admin/login-admin");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login-api-triup/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login-admin");
          return;
        }
        if (!res.ok) {
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
        router.replace("/admin/login-admin");
      });
  }, [router]);

  return allowed;
}
