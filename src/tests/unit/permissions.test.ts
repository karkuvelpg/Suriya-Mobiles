/**
 * Permission System Tests
 *
 * Tests requirement from Section 3: Owner must have full access to every
 * employee function. Employees must remain restricted to assigned permissions.
 */

import { describe, it, expect } from "vitest";
import {
  hasPermission,
  assertPermission,
  canAccessBranch,
  assertBranchAccess,
  getPermissionsForRole,
  type UserRole,
  type Permission,
} from "@/lib/permissions";

describe("Owner permissions — must have ALL permissions", () => {
  const owner: UserRole = "owner";

  const allPermissions: Permission[] = [
    "products.view", "products.create", "products.edit", "products.delete", "products.publish",
    "inventory.view", "inventory.adjust", "inventory.transfer", "inventory.receive_purchase",
    "suppliers.view", "suppliers.create", "suppliers.edit", "suppliers.delete",
    "purchase_orders.view", "purchase_orders.create", "purchase_orders.receive",
    "pos.access", "pos.session.open", "pos.session.close",
    "sales.create", "sales.view", "sales.apply_discount", "sales.apply_override_discount",
    "sales.cancel", "sales.return", "sales.refund", "sales.print_invoice",
    "customers.view", "customers.create", "customers.edit", "customers.delete",
    "orders.view", "orders.process", "orders.cancel", "orders.refund", "orders.fulfil",
    "reports.sales", "reports.inventory", "reports.financial", "reports.tax", "reports.branch",
    "staff.view", "staff.create", "staff.edit", "staff.delete", "staff.assign_branches",
    "branches.view", "branches.create", "branches.edit", "branches.delete",
    "settings.view", "settings.edit", "settings.billing",
    "audit.view", "audit.override",
  ];

  allPermissions.forEach((permission) => {
    it(`owner has permission: ${permission}`, () => {
      expect(hasPermission(owner, permission)).toBe(true);
    });
  });

  it("assertPermission does not throw for owner", () => {
    expect(() => assertPermission(owner, "sales.apply_override_discount")).not.toThrow();
    expect(() => assertPermission(owner, "audit.override")).not.toThrow();
    expect(() => assertPermission(owner, "settings.billing")).not.toThrow();
  });
});

describe("Cashier permissions — restricted to POS functions", () => {
  const cashier: UserRole = "cashier";

  const allowedPermissions: Permission[] = [
    "pos.access", "pos.session.open", "pos.session.close",
    "sales.create", "sales.view", "sales.apply_discount", "sales.print_invoice",
    "sales.return", "customers.view", "customers.create", "customers.edit",
    "products.view", "inventory.view", "orders.view", "orders.fulfil",
  ];

  const forbiddenPermissions: Permission[] = [
    "products.create", "products.edit", "products.delete", "products.publish",
    "inventory.adjust", "inventory.transfer",
    "suppliers.create", "suppliers.edit",
    "purchase_orders.create",
    "sales.apply_override_discount", "sales.refund", "sales.cancel",
    "customers.delete",
    "orders.process", "orders.cancel", "orders.refund",
    "reports.financial", "reports.tax",
    "staff.create", "staff.edit", "staff.delete",
    "branches.create", "branches.edit", "branches.delete",
    "settings.edit", "settings.billing",
    "audit.view", "audit.override",
  ];

  allowedPermissions.forEach((permission) => {
    it(`cashier has permission: ${permission}`, () => {
      expect(hasPermission(cashier, permission)).toBe(true);
    });
  });

  forbiddenPermissions.forEach((permission) => {
    it(`cashier does NOT have permission: ${permission}`, () => {
      expect(hasPermission(cashier, permission)).toBe(false);
    });
  });

  it("assertPermission throws for cashier accessing admin settings", () => {
    expect(() => assertPermission(cashier, "settings.edit")).toThrow(/Access denied/);
    expect(() => assertPermission(cashier, "staff.create")).toThrow(/Access denied/);
    expect(() => assertPermission(cashier, "sales.apply_override_discount")).toThrow(/Access denied/);
  });
});

describe("Inventory staff permissions", () => {
  const staff: UserRole = "inventory_staff";

  it("inventory_staff can view/create/edit products", () => {
    expect(hasPermission(staff, "products.view")).toBe(true);
    expect(hasPermission(staff, "products.create")).toBe(true);
    expect(hasPermission(staff, "products.edit")).toBe(true);
  });

  it("inventory_staff cannot access POS", () => {
    expect(hasPermission(staff, "pos.access")).toBe(false);
    expect(hasPermission(staff, "sales.create")).toBe(false);
  });

  it("inventory_staff cannot access financial reports", () => {
    expect(hasPermission(staff, "reports.financial")).toBe(false);
    expect(hasPermission(staff, "reports.tax")).toBe(false);
  });

  it("inventory_staff cannot manage staff", () => {
    expect(hasPermission(staff, "staff.create")).toBe(false);
    expect(hasPermission(staff, "staff.edit")).toBe(false);
  });
});

describe("Custom permissions granted to user", () => {
  it("cashier with custom permission can do override discount", () => {
    const customPerms: Permission[] = ["sales.apply_override_discount"];
    expect(hasPermission("cashier", "sales.apply_override_discount", customPerms)).toBe(true);
  });

  it("cashier without custom permission still cannot do override discount", () => {
    expect(hasPermission("cashier", "sales.apply_override_discount")).toBe(false);
  });
});

describe("Branch access control", () => {
  const branch1 = "branch-uuid-1";
  const branch2 = "branch-uuid-2";

  it("owner can access any branch", () => {
    expect(canAccessBranch("owner", branch1, [])).toBe(true);
    expect(canAccessBranch("owner", branch2, [branch1])).toBe(true);
  });

  it("admin can access any branch", () => {
    expect(canAccessBranch("admin", branch1, [])).toBe(true);
    expect(canAccessBranch("admin", branch2, [branch1])).toBe(true);
  });

  it("cashier can only access assigned branches", () => {
    expect(canAccessBranch("cashier", branch1, [branch1])).toBe(true);
    expect(canAccessBranch("cashier", branch2, [branch1])).toBe(false);
    expect(canAccessBranch("cashier", branch1, [])).toBe(false);
  });

  it("inventory_staff can only access assigned branches", () => {
    expect(canAccessBranch("inventory_staff", branch1, [branch1, branch2])).toBe(true);
    expect(canAccessBranch("inventory_staff", "branch-uuid-3", [branch1])).toBe(false);
  });

  it("assertBranchAccess throws for unauthorized branch", () => {
    expect(() => assertBranchAccess("cashier", branch2, [branch1])).toThrow(/not assigned/);
  });

  it("assertBranchAccess does not throw for owner on any branch", () => {
    expect(() => assertBranchAccess("owner", "any-branch", [])).not.toThrow();
  });
});

describe("Customer role — no business permissions", () => {
  it("customer has no business permissions", () => {
    const allBizPerms: Permission[] = [
      "products.create", "inventory.view", "pos.access", "sales.create",
      "reports.sales", "staff.view", "settings.view", "audit.view",
    ];
    allBizPerms.forEach((p) => {
      expect(hasPermission("customer", p)).toBe(false);
    });
  });
});
