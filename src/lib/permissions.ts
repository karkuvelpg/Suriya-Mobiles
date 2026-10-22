/**
 * Permission System for Suriya Mobiles
 *
 * Rules:
 * - Owner has ALL permissions by default (bypass check)
 * - Admin has most permissions except sensitive owner settings
 * - Cashier: POS, sales, cash sessions
 * - Inventory Staff: products, stock, suppliers
 * - Customer: own account only
 *
 * Permissions are ENFORCED server-side. Never trust client-supplied role values.
 */

export type UserRole = "owner" | "admin" | "cashier" | "inventory_staff" | "customer";

export type Permission =
  // ── Products ──────────────────────────────────────────────────────────────
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "products.publish"
  // ── Inventory ─────────────────────────────────────────────────────────────
  | "inventory.view"
  | "inventory.adjust"
  | "inventory.transfer"
  | "inventory.receive_purchase"
  // ── Suppliers ─────────────────────────────────────────────────────────────
  | "suppliers.view"
  | "suppliers.create"
  | "suppliers.edit"
  | "suppliers.delete"
  | "purchase_orders.view"
  | "purchase_orders.create"
  | "purchase_orders.receive"
  // ── POS / Sales ───────────────────────────────────────────────────────────
  | "pos.access"
  | "pos.session.open"
  | "pos.session.close"
  | "sales.create"
  | "sales.view"
  | "sales.apply_discount"
  | "sales.apply_override_discount"
  | "sales.cancel"
  | "sales.return"
  | "sales.refund"
  | "sales.print_invoice"
  // ── Customers ─────────────────────────────────────────────────────────────
  | "customers.view"
  | "customers.create"
  | "customers.edit"
  | "customers.delete"
  // ── Orders ────────────────────────────────────────────────────────────────
  | "orders.view"
  | "orders.process"
  | "orders.cancel"
  | "orders.refund"
  | "orders.fulfil"
  // ── Reports ───────────────────────────────────────────────────────────────
  | "reports.sales"
  | "reports.inventory"
  | "reports.financial"
  | "reports.tax"
  | "reports.branch"
  // ── Staff & Permissions ───────────────────────────────────────────────────
  | "staff.view"
  | "staff.create"
  | "staff.edit"
  | "staff.delete"
  | "staff.assign_branches"
  // ── Branches ─────────────────────────────────────────────────────────────
  | "branches.view"
  | "branches.create"
  | "branches.edit"
  | "branches.delete"
  // ── Organisation Settings ─────────────────────────────────────────────────
  | "settings.view"
  | "settings.edit"
  | "settings.billing"
  // ── Audit ─────────────────────────────────────────────────────────────────
  | "audit.view"
  | "audit.override";

// ─── Role Permission Map ───────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<Exclude<UserRole, "owner">, Permission[]> = {
  admin: [
    "products.view", "products.create", "products.edit", "products.publish",
    "inventory.view", "inventory.adjust", "inventory.transfer", "inventory.receive_purchase",
    "suppliers.view", "suppliers.create", "suppliers.edit",
    "purchase_orders.view", "purchase_orders.create", "purchase_orders.receive",
    "pos.access", "pos.session.open", "pos.session.close",
    "sales.create", "sales.view", "sales.apply_discount", "sales.cancel", "sales.return", "sales.refund", "sales.print_invoice",
    "customers.view", "customers.create", "customers.edit",
    "orders.view", "orders.process", "orders.cancel", "orders.refund", "orders.fulfil",
    "reports.sales", "reports.inventory", "reports.financial", "reports.tax", "reports.branch",
    "staff.view", "staff.create", "staff.edit", "staff.assign_branches",
    "branches.view", "branches.create", "branches.edit",
    "settings.view", "settings.edit",
    "audit.view",
  ],
  cashier: [
    "pos.access", "pos.session.open", "pos.session.close",
    "sales.create", "sales.view", "sales.apply_discount", "sales.print_invoice",
    "sales.return",
    "customers.view", "customers.create", "customers.edit",
    "products.view",
    "inventory.view",
    "orders.view", "orders.fulfil",
  ],
  inventory_staff: [
    "products.view", "products.create", "products.edit",
    "inventory.view", "inventory.adjust", "inventory.transfer", "inventory.receive_purchase",
    "suppliers.view",
    "purchase_orders.view", "purchase_orders.create", "purchase_orders.receive",
    "branches.view",
  ],
  customer: [],
};

// ─── Permission Checker ────────────────────────────────────────────────────────

/**
 * Returns true if the user has the given permission.
 * Owners bypass all permission checks.
 */
export function hasPermission(
  role: UserRole,
  permission: Permission,
  customPermissions?: Permission[]
): boolean {
  // Owner has EVERYTHING — no exceptions
  if (role === "owner") return true;

  // Check role default permissions
  const rolePerms = ROLE_PERMISSIONS[role as Exclude<UserRole, "owner">] ?? [];
  if (rolePerms.includes(permission)) return true;

  // Check custom permissions granted by owner/admin
  if (customPermissions?.includes(permission)) return true;

  return false;
}

/**
 * Returns all permissions for a given role.
 * Owner gets every permission in the system.
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  if (role === "owner") {
    // Return all defined permissions
    return Object.values(ROLE_PERMISSIONS).flat() as Permission[];
  }
  return ROLE_PERMISSIONS[role as Exclude<UserRole, "owner">] ?? [];
}

/**
 * Throws an error if the user lacks the required permission.
 * Use at the start of Server Actions and API Route Handlers.
 */
export function assertPermission(
  role: UserRole,
  permission: Permission,
  customPermissions?: Permission[]
): void {
  if (!hasPermission(role, permission, customPermissions)) {
    throw new Error(
      `Access denied: role '${role}' does not have permission '${permission}'.`
    );
  }
}

/**
 * Checks if a user can access a specific branch.
 * Owners and admins can access all branches.
 * Other staff can only access their assigned branches.
 */
export function canAccessBranch(
  role: UserRole,
  targetBranchId: string,
  assignedBranchIds: string[]
): boolean {
  if (role === "owner" || role === "admin") return true;
  return assignedBranchIds.includes(targetBranchId);
}

/**
 * Throws an error if the user cannot access the given branch.
 */
export function assertBranchAccess(
  role: UserRole,
  targetBranchId: string,
  assignedBranchIds: string[]
): void {
  if (!canAccessBranch(role, targetBranchId, assignedBranchIds)) {
    throw new Error(
      `Access denied: you are not assigned to branch '${targetBranchId}'.`
    );
  }
}
