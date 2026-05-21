"use client";

import { useEffect, useCallback, useRef } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getDb } from "@/lib/db-local";
import { createReservation } from "@/actions/tables";

let globalIsBookingSyncing = false;

/**
 * Runs in the background of any page that imports it.
 * When internet returns, it drains the pendingReservations queue
 * and sends each reservation to the server.
 */
export function usePendingBookingSync(onSyncComplete?: () => void) {
  const isOnline = useNetworkStatus();

  const drainQueue = useCallback(async () => {
    if (globalIsBookingSyncing) return;
    globalIsBookingSyncing = true;

    try {
      const db = await getDb();
      if (!db) return;

      const pending = await db.table('pendingReservations')
        .where("status")
        .equals("pending")
        .toArray();

      if (pending.length === 0) return;

      console.log(`[OfflineBookingSync] Syncing ${pending.length} pending bookings…`);

      for (const item of pending) {
        // Mark as syncing so we don't re-attempt concurrently
        await db.table('pendingReservations').update(item.localId!, { status: "syncing" });

        try {
          const res = await createReservation(item.reservationData);
          if (res.success) {
            await db.table('pendingReservations').delete(item.localId!);
            if (item.tempId) {
              await db.table('reservations').delete(item.tempId);
            }
            console.log(`[OfflineBookingSync] Booking ${item.localId} synced ✅`);
          } else {
            await db.table('pendingReservations').update(item.localId!, {
              status: "failed",
              error: "Server rejected the booking",
            });
          }
        } catch (err: any) {
          await db.table('pendingReservations').update(item.localId!, {
            status: "pending", // retry on next reconnect
            error: err?.message ?? "Network error",
          });
        }
      }

      onSyncComplete?.();
    } catch (err) {
      console.error("[OfflineBookingSync] Failed to drain queue", err);
    } finally {
      globalIsBookingSyncing = false;
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
 * Call this instead of createReservation() directly.
 * If online  → calls server immediately.
 * If offline → saves to IndexedDB pendingReservations queue.
 */
export async function submitReservationWithFallback(
  data: Parameters<typeof createReservation>[0]
): Promise<{ success: boolean; offline?: boolean; error?: string }> {
  if (typeof navigator !== "undefined" && navigator.onLine) {
    // Online path — try server first
    try {
      const res = await createReservation(data);
      return res;
    } catch {
      // fall through to offline path if network call itself throws
    }
  }

  // Offline path — queue locally
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "Local DB unavailable" };

    const tempId = `OFFLINE-RES-${Date.now()}`;
    const tempReservation = {
      id: tempId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tableId: data.tableId,
      guestsCount: data.guestsCount,
      reservationTime: data.reservationTime.toISOString(),
      status: "confirmed", // Assume confirmed offline
      table: {
        id: data.tableId,
        tableNumber: "TBD", // Or we can fetch the table number locally if we need to
      }
    };

    // Save temp reservation for read-back in Tables
    await db.table('reservations').add(tempReservation);

    // Queue the write for later sync
    await db.table('pendingReservations').add({
      reservationData: data,
      tempId: tempId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { success: true, offline: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Failed to save offline booking" };
  }
}
