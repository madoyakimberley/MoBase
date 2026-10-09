export type Role = "SUPER_ADMIN" | "DEVELOPER" | "CLIENT";

/**
 * Validates role-based resource access scope boundaries.
 */
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
    // Requires target developer ownership; returns false for unclaimed leads lacking a target dev
    if (!targetDevId || !userDevId) return false;
    return userDevId === targetDevId;
  }

  if (userRole === "CLIENT") {
    if (!targetProjectId || !userProjectId) return false;
    return userProjectId === targetProjectId;
  }

  return false;
}

/**
 * Validates that incoming non-GET requests originate from the same site.
 */
export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Validates text input length (1 to 1,000 characters) without encoding quotes/apostrophes.
 * React automatically escapes DOM output and Drizzle parameterizes SQL queries.
 */
export function validateMessageText(text: unknown): {
  valid: boolean;
  cleanText: string;
  error?: string;
} {
  if (typeof text !== "string") {
    return { valid: false, cleanText: "", error: "Message must be a string." };
  }

  const cleanText = text.trim();

  if (cleanText.length < 1 || cleanText.length > 1000) {
    return {
      valid: false,
      cleanText: "",
      error: "Message must be between 1 and 1,000 characters.",
    };
  }

  return { valid: true, cleanText };
}

/**
 * Clean string trimming without HTML entity mangling (avoids turning Bob's into Bob&#x27;s).
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim();
}

/**
 * Logs error details safely without exposing sensitive message body contents.
 */
export function logError(context: string, leadId: string, err: any) {
  console.error(`[SECURITY LOG] ${context} | Lead ID: ${leadId}`, {
    errorName: err?.name || "Error",
    errorMessage: err?.message || "Unknown error occurred",
  });
}
