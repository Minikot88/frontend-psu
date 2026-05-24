"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/psu/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          router.replace("/login");
          return null;
        }
        if (!res.ok) {
          router.replace("/login");
          return null;
        }
        setReady(true);
        return null;
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
