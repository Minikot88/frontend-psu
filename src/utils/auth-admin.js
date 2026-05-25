export function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;

  try {
    const token = localStorage.getItem("token");
    const exp = localStorage.getItem("token_exp");

    if (!token || !exp) return false;

    const now = Date.now();
    return now < Number(exp); // token ยังไม่หมดอายุ
  } catch {
    return false;
  }
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("token_exp");
  localStorage.removeItem("roles_id");
  localStorage.removeItem("admin_profile");
  document.cookie =
    "admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export function logoutAdmin() {
  clearAdminAuth();
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  return token || null;
}

export async function authAdminFetch(url, options = {}) {
  const token = getAdminToken();
  if (!token) {
    const error = new Error("unauthenticated");
    error.status = 401;
    throw error;
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    const error = new Error(res.status === 401 ? "unauthenticated" : "forbidden");
    error.status = res.status;
    throw error;
  }
  return res;
}
