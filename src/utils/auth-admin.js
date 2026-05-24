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

export function logoutAdmin() {
  localStorage.removeItem("token");
  localStorage.removeItem("token_exp");
  document.cookie =
    "admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}
