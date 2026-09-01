import { getAuthContext } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES = [
  "super_admin",
  "operations_admin",
  "finance_admin",
  "compliance_admin",
  "support_admin",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "users", "auctions", "products", "payments", "orders", "refunds",
    "reports", "audit", "settings", "notifications", "support",
  ],
  operations_admin: ["users", "auctions", "products", "orders", "notifications", "support"],
  finance_admin: ["payments", "refunds", "orders", "reports", "audit"],
  compliance_admin: ["users", "audit", "reports", "settings"],
  support_admin: ["users", "support", "notifications", "orders"],
};

export function getAdminRole(context: { role: string } | null) {
  if (!context) return null;
  return ADMIN_ROLES.includes(context.role) ? context.role : null;
}

export function requireAdmin(request: NextRequest, module?: string) {
  return async (): Promise<
    { context: { userId: string; role: string; sessionId: string } } | { error: NextResponse }
  > => {
    const context = await getAuthContext(request);
    if (!context) {
      return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const role = getAdminRole(context);
    if (!role) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }

    if (module) {
      const perms = ROLE_PERMISSIONS[role] || [];
      if (!perms.includes(module)) {
        return { error: NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }) };
      }
    }

    return { context };
  };
}
