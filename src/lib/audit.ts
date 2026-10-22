import db from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema/audit";
import type { SessionUser } from "@/lib/auth/session";

interface AuditOptions {
  actor: SessionUser | { id: string; email: string; role: string };
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  previousState?: unknown;
  newState?: unknown;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Records an immutable audit log entry.
 * Call this for every financially, security, or operationally significant action.
 * Never throws — audit logging failure must never break the main transaction.
 */
export async function logAudit(options: AuditOptions): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      organisationId: (options.actor as SessionUser).organisationId ?? undefined,
      actorId: options.actor.id,
      actorRole: options.actor.role,
      actorEmail: options.actor.email,
      action: options.action,
      module: options.module,
      entityType: options.entityType,
      entityId: options.entityId,
      previousState: options.previousState
        ? JSON.parse(JSON.stringify(options.previousState))
        : null,
      newState: options.newState
        ? JSON.parse(JSON.stringify(options.newState))
        : null,
      reason: options.reason,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      metadata: options.metadata ?? {},
    });
  } catch (err) {
    // Log to stderr but never propagate — audit failure must not break main flow
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

// ─── Convenience Wrappers ─────────────────────────────────────────────────────

export const audit = {
  saleCreated: (actor: SessionUser, saleId: string, data: unknown) =>
    logAudit({ actor, action: "sale.create", module: "sales", entityType: "sale", entityId: saleId, newState: data }),

  saleCancelled: (actor: SessionUser, saleId: string, reason: string, data: unknown) =>
    logAudit({ actor, action: "sale.cancel", module: "sales", entityType: "sale", entityId: saleId, reason, previousState: data }),

  saleReturned: (actor: SessionUser, saleId: string, reason: string, data: unknown) =>
    logAudit({ actor, action: "sale.return", module: "sales", entityType: "sale", entityId: saleId, reason, newState: data }),

  inventoryAdjusted: (actor: SessionUser, productId: string, reason: string, prev: unknown, next: unknown) =>
    logAudit({ actor, action: "inventory.adjust", module: "inventory", entityType: "product", entityId: productId, reason, previousState: prev, newState: next }),

  productPublished: (actor: SessionUser, productId: string) =>
    logAudit({ actor, action: "product.publish", module: "products", entityType: "product", entityId: productId }),

  productUnpublished: (actor: SessionUser, productId: string) =>
    logAudit({ actor, action: "product.unpublish", module: "products", entityType: "product", entityId: productId }),

  staffCreated: (actor: SessionUser, staffId: string, data: unknown) =>
    logAudit({ actor, action: "staff.create", module: "staff", entityType: "user", entityId: staffId, newState: data }),

  staffDeleted: (actor: SessionUser, staffId: string, data: unknown) =>
    logAudit({ actor, action: "staff.delete", module: "staff", entityType: "user", entityId: staffId, previousState: data }),

  ownerOverride: (actor: SessionUser, action: string, entityId: string, reason: string, data: unknown) =>
    logAudit({ actor, action: `owner.override.${action}`, module: "override", entityType: action, entityId, reason, newState: data }),

  paymentVerified: (actor: SessionUser | { id: string; email: string; role: string }, orderId: string, data: unknown) =>
    logAudit({ actor, action: "payment.verified", module: "payments", entityType: "order", entityId: orderId, newState: data }),

  refundProcessed: (actor: SessionUser, refundId: string, data: unknown) =>
    logAudit({ actor, action: "refund.process", module: "payments", entityType: "refund", entityId: refundId, newState: data }),

  sessionOpened: (actor: SessionUser, sessionId: string) =>
    logAudit({ actor, action: "cash_session.open", module: "pos", entityType: "cash_session", entityId: sessionId }),

  sessionClosed: (actor: SessionUser, sessionId: string, data: unknown) =>
    logAudit({ actor, action: "cash_session.close", module: "pos", entityType: "cash_session", entityId: sessionId, newState: data }),
};
