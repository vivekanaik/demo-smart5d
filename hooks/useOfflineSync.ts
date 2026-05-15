import { useEffect } from 'react';
import { getDb } from '@/lib/db-local';
import { useNetworkStatus } from './useNetworkStatus';
import { getAdminOrders } from '@/actions/adminOrders';
import { getPOSData } from '@/actions/pos';

export function useOfflineSync() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) return;

    const syncDataToLocal = async () => {
      try {
        // Fetch fresh data from server
        const [ordersRes, posRes] = await Promise.all([
          getAdminOrders(),
          getPOSData()
        ]);

        const db = await getDb();
        if (!db) return;

        // Sync Orders
        if (ordersRes.success && ordersRes.orders) {
          await db.table('activeOrders').clear();
          await db.table('activeOrders').bulkAdd(ordersRes.orders as any[]);
        }

        // Sync Menu Items
        if (posRes.success && posRes.items) {
          await db.table('menuItems').clear();
          await db.table('menuItems').bulkAdd(posRes.items as any[]);
        }

        // Sync Tables
        if (posRes.success && posRes.tables) {
          await db.table('tables').clear();
          await db.table('tables').bulkAdd(posRes.tables as any[]);
        }

        console.log("Offline cache updated successfully");
      } catch (error) {
        console.error('Offline sync failed:', error);
      }
    };

    syncDataToLocal();
  }, [isOnline]);

  return null;
}
