import { getCustomers } from "@/actions/customers";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { Users } from "lucide-react";

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Customers
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your customer base, aggregated from order history.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <Users className="h-4 w-4 text-yellow-500" />
          {customers.length} Total Customers
        </div>
      </div>

      <CustomersTable initialCustomers={customers} />
    </div>
  );
}
