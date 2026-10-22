import { createSupabaseServerClient } from "@/lib/supabase/server";
import db from "@/lib/db/client";
import { orgMembers, branchMembers } from "@/lib/db/schema/users";
import { eq, and } from "drizzle-orm";
import type { UserRole, Permission } from "@/lib/permissions";
import { hasPermission, assertPermission, canAccessBranch } from "@/lib/permissions";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  organisationId: string;
  customPermissions: Permission[];
  assignedBranchIds: string[];
}

/**
 * Retrieves the current authenticated user with their role and org context.
 * Uses Supabase auth for identity, then our DB for role/permissions.
 * Returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Fetch org membership (first active org for now — multi-org to be extended)
  const [membership] = await db
    .select({
      role: orgMembers.role,
      organisationId: orgMembers.organisationId,
      customPermissions: orgMembers.customPermissions,
    })
    .from(orgMembers)
    .where(
      and(
        eq(orgMembers.userId, user.id),
        eq(orgMembers.isActive, true)
      )
    )
    .limit(1);

  if (!membership) return null;

  // Fetch branch assignments
  const branches = await db
    .select({ branchId: branchMembers.branchId })
    .from(branchMembers)
    .where(
      and(
        eq(branchMembers.userId, user.id),
        eq(branchMembers.isActive, true),
        eq(branchMembers.organisationId, membership.organisationId)
      )
    );

  return {
    id: user.id,
    email: user.email ?? "",
    role: membership.role as UserRole,
    organisationId: membership.organisationId,
    customPermissions: (membership.customPermissions as Permission[]) ?? [],
    assignedBranchIds: branches.map((b) => b.branchId),
  };
}

/**
 * Like getSessionUser, but redirects to login if not authenticated.
 * Use in protected Server Components and Server Actions.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Requires authentication AND a specific permission.
 * Redirects to login if not authenticated; throws if permission denied.
 */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireAuth();
  assertPermission(user.role, permission, user.customPermissions);
  return user;
}

/**
 * Requires authentication AND branch access.
 */
export async function requireBranchAccess(branchId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (!canAccessBranch(user.role, branchId, user.assignedBranchIds)) {
    throw new Error(`You do not have access to branch: ${branchId}`);
  }
  return user;
}

/**
 * Checks if current user has a specific permission without throwing.
 * For conditional rendering in Server Components.
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  return hasPermission(user.role, permission, user.customPermissions);
}
