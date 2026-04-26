import { randomBytes } from "crypto";
import prisma from "@/lib/db";

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Default session duration: 6 hours
 */
export function getSessionExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 6);
  return expiry;
}

/**
 * Validate a table session token and return the associated order.
 * Returns null if invalid, expired, or inactive.
 */
export async function validateTableSession(token: string) {
  if (!token || typeof token !== "string" || token.length < 16) {
    return null;
  }

  const session = await prisma.tableSession.findUnique({
    where: { token },
    include: {
      order: {
        include: {
          items: { orderBy: { createdAt: "asc" } },
          table: { include: { area: true } },
        },
      },
      table: true,
    },
  });

  if (!session) return null;
  if (!session.isActive) return null;
  if (session.expiresAt < new Date()) {
    // Auto-deactivate expired sessions
    await prisma.tableSession.update({
      where: { id: session.id },
      data: { isActive: false },
    });
    return null;
  }

  // Don't allow additional orders on already-paid/cancelled orders
  if (
    session.order.status === "PAID" ||
    session.order.status === "CANCELLED"
  ) {
    return null;
  }

  return session;
}

/**
 * Get the next batch number for an order
 */
export async function getNextBatchNumber(orderId: string): Promise<number> {
  const maxBatch = await prisma.orderItem.aggregate({
    where: { orderId },
    _max: { batchNumber: true },
  });

  return (maxBatch._max.batchNumber ?? 0) + 1;
}
