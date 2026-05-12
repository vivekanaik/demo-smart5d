import { getPOSData } from "@/actions/pos";
import { POSClient } from "@/components/admin/pos/POSClient";

export default async function AdminPOSPage() {
  const data = await getPOSData();
  
  if (!data.success) {
    return <div className="p-8 text-red-500">Failed to load POS data.</div>;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">POS Billing</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Create new orders and send them to the kitchen.</p>
      </div>
      
      <POSClient items={data.items || []} tables={data.tables || []} />
    </div>
  );
}
