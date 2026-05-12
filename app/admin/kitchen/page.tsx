import { getActiveKitchenOrders } from "@/actions/kitchen";
import { KitchenBoard } from "@/components/admin/KitchenBoard";
import { Order } from "@/components/admin/OrdersTable";

// Disable caching for the kitchen board to ensure fresh data on reload
export const dynamic = "force-dynamic";

export default async function AdminKitchenPage() {
  const result = await getActiveKitchenOrders();

  if (!result.success) {
    return <div className="p-8 text-red-500">Failed to load kitchen tickets.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Kitchen Display</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Live order tickets for the chefs. Oldest tickets appear first.</p>
        </div>
      </div>

      <KitchenBoard initialTickets={(result.tickets as Order[]) || []} />
    </div>
  );
}
