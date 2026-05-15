import { getPOSData } from "@/actions/pos";
import { POSClient } from "@/components/admin/pos/POSClient";
import { safeQuery } from "@/lib/safe-query";

export default async function AdminBillingPage() {
  const data = await safeQuery(() => getPOSData(), { success: false, items: [], tables: [] });

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Billing</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Create new orders and send them to the kitchen.</p>
      </div>
      
      <POSClient items={data.items || []} tables={data.tables || []} />
    </div>
  );
}
