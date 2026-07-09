export const AUTH_ROUTES = {
  login: "/admin/login",
  dashboard: "/admin/dashboard",
  callback: "/auth/callback",
} as const;

export const PUBLIC_ADMIN_ROUTES = [AUTH_ROUTES.login] as const;

export const PROTECTED_ADMIN_PREFIX = "/admin";
