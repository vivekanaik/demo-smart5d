"use client";

import { useState } from "react";
import { Edit2, Search, X, Check, Loader2 } from "lucide-react";
import { updateCustomer } from "@/actions/customers";

type Customer = {
  name: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
};

export function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Edit form state
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Filter customers based on search
  const filteredCustomers = initialCustomers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name || "", phone: customer.phone || "" });
  };

  const closeEdit = () => {
    setEditingCustomer(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.phone) return;
    
    setIsSaving(true);
    try {
      await updateCustomer(editingCustomer.phone, formData.name, formData.phone);
      closeEdit();
    } catch (error) {
      console.error("Failed to update customer:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name or WhatsApp number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-yellow-500"
        />
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
            <thead className="border-b border-zinc-200 bg-zinc-50/50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">WhatsApp Number</th>
                <th className="px-6 py-4 font-medium text-center">Visits (Orders)</th>
                <th className="px-6 py-4 font-medium text-right">Total Worth</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {customer.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      ₹{customer.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(customer)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-yellow-600 dark:hover:bg-zinc-800 dark:hover:text-yellow-500"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Edit Customer</h2>
              <button
                onClick={closeEdit}
                disabled={isSaving}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  />
                </div>
                <div className="rounded-md bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500">
                  <strong>Note:</strong> Updating this information will retroactively update the name and number on all past orders associated with the original number.
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={isSaving}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-400 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
