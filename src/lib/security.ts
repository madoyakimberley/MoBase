/**
 * Sanitizes input strings against Script Injection & XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validates role-based resource access scope boundaries
 */
export type Role = "SUPER_ADMIN" | "DEVELOPER" | "CLIENT";

export function verifyScopeAccess(params: {
  userRole: Role;
  userDevId?: string;
  targetDevId?: string;
  userProjectId?: string;
  targetProjectId?: string;
}): boolean {
  const { userRole, userDevId, targetDevId, userProjectId, targetProjectId } =
    params;

  if (userRole === "SUPER_ADMIN") return true;

  if (userRole === "DEVELOPER") {
    if (!targetDevId) return true;
    return userDevId === targetDevId;
  }

  if (userRole === "CLIENT") {
    if (!targetProjectId) return false;
    return userProjectId === targetProjectId;
  }

  return false;
}
