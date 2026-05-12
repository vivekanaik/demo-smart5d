import { getCustomers } from "@/actions/customers";
import { Search, Star, Medal } from "lucide-react";
import { format } from "date-fns";

export default async function AdminCustomersPage() {
  const result = await getCustomers();
  const customersList = result.success ? result.customers : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Customer Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage CRM, loyalty points, and VIPs.</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Loyalty Points</th>
                <th className="px-6 py-4 font-medium">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {customersList?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customersList?.map((customer: any, index: number) => {
                  const isVIP = index < 3 && customer.totalSpent > 0; // Top 3 spenders
                  
                  return (
                    <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          {isVIP && <span title="VIP Customer"><Medal className="h-4 w-4 text-amber-500" /></span>}
                          {customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-900 dark:text-zinc-100">{customer.phone}</div>
                        <div className="text-xs text-zinc-500">{customer.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">
                        {customer.totalOrders}
                      </td>
                      <td className="px-6 py-4 font-bold text-yellow-600 dark:text-yellow-400">
                        ₹{customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          <Star className="h-3 w-3" />
                          {customer.loyaltyPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {format(new Date(customer.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
