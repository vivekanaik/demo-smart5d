"use client";

import { useEffect, useCallback, useRef } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getDb } from "@/lib/db-local";
import { createOrder } from "@/actions/pos";
import { updateOrderStatus } from "@/actions/orders";

/**
 * Runs in the background of any page that imports it.
 * When internet returns, it drains the pendingOrders queue
 * and sends each order to the server.
 */
export function usePendingOrderSync(onSyncComplete?: () => void) {
  const isOnline = useNetworkStatus();
  const isSyncing = useRef(false);

  const drainQueue = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      const db = await getDb();
      if (!db) return;

      const pending = await db.table('pendingOrders')
        .where("status")
        .equals("pending")
        .toArray();

      if (pending.length === 0) return;

      console.log(`[OfflineSync] Syncing ${pending.length} pending orders…`);

      for (const item of pending) {
        // Mark as syncing so we don't re-attempt concurrently
        await db.table('pendingOrders').update(item.localId!, { status: "syncing" });

        try {
          if (item.orderData?.type === "statusUpdate") {
            // ── Sync a close/cancel/restore action ────────────────────────
            await updateOrderStatus(item.orderData.orderId, item.orderData.status);
            await db.table('pendingOrders').delete(item.localId!);
            // Keep the local record in sync
            await db.table('activeOrders').update(item.orderData.orderId, {
              status: item.orderData.status,
            });
            console.log(`[OfflineSync] Status update ${item.orderData.orderId} → ${item.orderData.status} synced ✅`);
          } else {
            // ── Sync a new order creation ──────────────────────────────────
            const res = await createOrder(item.orderData);
            if (res.success) {
              await db.table('pendingOrders').delete(item.localId!);
              console.log(`[OfflineSync] Order ${item.localId} synced ✅`);
            } else {
              await db.table('pendingOrders').update(item.localId!, {
                status: "failed",
                error: "Server rejected the order",
              });
            }
          }
        } catch (err: any) {
          await db.table('pendingOrders').update(item.localId!, {
            status: "pending", // retry on next reconnect
            error: err?.message ?? "Network error",
          });
        }
      }

      onSyncComplete?.();
    } catch (err) {
      console.error("[OfflineSync] Failed to drain queue", err);
    } finally {
      isSyncing.current = false;
    }
  }, [onSyncComplete]);

  // Trigger drain whenever the device comes back online
  useEffect(() => {
    if (isOnline) {
      drainQueue();
    }
  }, [isOnline, drainQueue]);

  return { drainQueue };
}

/**
 * Call this instead of createOrder() directly.
 * If online  → calls server immediately.
 * If offline → saves to IndexedDB pendingOrders queue.
 */
export async function submitOrderWithFallback(
  data: Parameters<typeof createOrder>[0]
): Promise<{ success: boolean; offline?: boolean; error?: string }> {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    // Online path — try server first
    try {
      const res = await createOrder(data);
      return res;
    } catch {
      // fall through to offline path if network call itself throws
    }
  }

  // Offline path — queue locally
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "Local DB unavailable" };

    // Build a temporary order to show in the UI immediately
    const tempId = `OFFLINE-${Date.now()}`;
    const tempOrder = {
      id: tempId,
      guestName: data.guestName,
      tableNumber: data.tableNumber,
      contactNumber: data.contactNumber ?? null,
      cashierName: data.cashierName ?? null,
      notes: data.notes ?? null,
      total: data.total,
      status: "active",
      createdAt: new Date().toISOString(),
      items: data.items.map((item, i) => ({
        id: i,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: "pending",
        createdAt: new Date().toISOString(),
      })),
    };

    // Save temp order for read-back in Billing/Kitchen
    await db.table('activeOrders').add(tempOrder);

    // Queue the write for later sync
    await db.table('pendingOrders').add({
      orderData: data,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { success: true, offline: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to save offline" };
  }
}
