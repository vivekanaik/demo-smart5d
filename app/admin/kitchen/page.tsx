import { getActiveOrders, getClosedOrders, getCancelledOrders } from "@/actions/orders";
import { KitchenDashboardClient } from "@/components/admin/kitchen/KitchenDashboardClient";
import type { ComponentProps } from "react";

type KitchenOrders = ComponentProps<typeof KitchenDashboardClient>["initialActiveOrders"];

// Disable caching to ensure fresh data on reload
export const dynamic = "force-dynamic";

export default async function AdminKitchenPage() {
  let activeOrders: KitchenOrders = [];
  let closedOrders: KitchenOrders = [];
  let cancelledOrders: KitchenOrders = [];

  try {
    [activeOrders, closedOrders, cancelledOrders] = await Promise.all([
      getActiveOrders() as Promise<KitchenOrders>,
      getClosedOrders() as Promise<KitchenOrders>,
      getCancelledOrders() as Promise<KitchenOrders>,
    ]);
  } catch {
    // Offline or DB unavailable — client component will load from IndexedDB
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Kitchen Display</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Live order tickets for the chefs. Oldest tickets appear first.</p>
        </div>
      </div>

      <KitchenDashboardClient 
        initialActiveOrders={activeOrders} 
        initialClosedOrders={closedOrders} 
        initialCancelledOrders={cancelledOrders} 
      />
    </div>
  );
}
