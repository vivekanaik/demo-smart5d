"use client";

import { useState, useTransition } from "react";
import {
  Search, Plus, Trash2, Pencil, AlertTriangle, X, Save, Clock, PackageSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  addInventoryItem, updateInventoryItem, deleteInventoryItem
} from "@/actions/inventory";

export type InventoryItem = {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  minStockAlert: number;
  vendorName: string | null;
  status: "active" | "discontinued" | "on_order";
  lastRestocked: Date | null;
  createdAt: Date;
};

const UNITS = ["kg", "g", "liters", "ml", "units", "dozen", "boxes", "packets", "bottles"];
const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_order", label: "On Order" },
  { value: "discontinued", label: "Discontinued" },
] as const;

// ─── Shared form fields ───────────────────────────────────────────────────────
function InventoryForm({
  form,
  setForm,
  error,
}: {
  form: any;
  setForm: (fn: (f: any) => any) => void;
  error: string;
}) {
  const inputCls = "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Item Name *</label>
          <input type="text" placeholder="e.g. Basmati Rice" value={form.itemName}
            onChange={(e) => setForm((f: any) => ({ ...f, itemName: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quantity *</label>
          <input type="number" min="0" placeholder="0" value={form.quantity}
            onChange={(e) => setForm((f: any) => ({ ...f, quantity: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit *</label>
          <select value={form.unit} onChange={(e) => setForm((f: any) => ({ ...f, unit: e.target.value }))}
            className={`admin-select ${inputCls}`}>
            <option value="">Select unit</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Min Stock Alert</label>
          <input type="number" min="0" placeholder="10" value={form.minStockAlert}
            onChange={(e) => setForm((f: any) => ({ ...f, minStockAlert: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
            className={`admin-select ${inputCls}`}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vendor / Supplier</label>
          <input type="text" placeholder="e.g. Metro Cash & Carry" value={form.vendorName}
            onChange={(e) => setForm((f: any) => ({ ...f, vendorName: e.target.value }))}
            className={inputCls} />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Last Restocked Date
          </label>
          <input type="date" value={form.lastRestocked}
            onChange={(e) => setForm((f: any) => ({ ...f, lastRestocked: e.target.value }))}
            className={inputCls} />
          <p className="text-xs text-zinc-400 mt-1">Leave empty if not yet restocked.</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddInventoryModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    itemName: "", quantity: "", unit: "", minStockAlert: "10",
    vendorName: "", status: "active", lastRestocked: "",
  });

  const handleSubmit = () => {
    if (!form.itemName || !form.quantity || !form.unit) {
      setError("Item name, quantity and unit are required.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await addInventoryItem({
        itemName: form.itemName,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        minStockAlert: parseInt(form.minStockAlert) || 10,
        vendorName: form.vendorName || undefined,
        status: form.status as any,
        lastRestocked: form.lastRestocked ? new Date(form.lastRestocked) : undefined,
      });
      if (res.success) onClose();
      else setError(res.error || "Failed to add item.");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add Inventory Item</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <InventoryForm form={form} setForm={setForm} error={error} />

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isPending ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditInventoryModal({ item, onClose, onUpdate }: { item: InventoryItem; onClose: () => void; onUpdate: (id: number, data: Partial<InventoryItem>) => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    itemName: item.itemName,
    quantity: item.quantity.toString(),
    unit: item.unit,
    minStockAlert: item.minStockAlert.toString(),
    vendorName: item.vendorName || "",
    status: item.status,
    lastRestocked: item.lastRestocked ? format(new Date(item.lastRestocked), "yyyy-MM-dd") : "",
  });

  const handleSubmit = () => {
    startTransition(async () => {
      const data = {
        itemName: form.itemName,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        minStockAlert: parseInt(form.minStockAlert) || 10,
        vendorName: form.vendorName || undefined,
        status: form.status as any,
        lastRestocked: form.lastRestocked ? new Date(form.lastRestocked) : null,
      };
      const res = await updateInventoryItem(item.id, data);
      if (res.success) {
        onUpdate(item.id, { ...data, lastRestocked: data.lastRestocked ?? null });
        onClose();
      } else {
        setError(res.error || "Failed to update.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Item</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="mb-4 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          Added on <span className="font-medium text-zinc-700 dark:text-zinc-300">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
        </div>

        <InventoryForm form={form} setForm={setForm} error={error} />

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Inventory Table ─────────────────────────────────────────────────────
export function InventoryTable({
  initialItems,
  showAddModal,
  onCloseAdd,
}: {
  initialItems: InventoryItem[];
  showAddModal: boolean;
  onCloseAdd: () => void;
}) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = items.filter((item) => {
    const matchesSearch = item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendorName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteInventoryItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setDeletingId(null);
    });
  };

  const handleUpdate = (id: number, data: Partial<InventoryItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const lowStockCount = items.filter(i => i.quantity <= i.minStockAlert).length;
  const activeCount = items.filter(i => i.status === "active").length;

  return (
    <>
      {showAddModal && <AddInventoryModal onClose={onCloseAdd} />}
      {editingItem && (
        <EditInventoryModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete confirm */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Item?</h3>
            <p className="text-sm text-zinc-500 mb-6">This will permanently remove the item from your inventory.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60">
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: items.length, color: "text-zinc-900 dark:text-zinc-100" },
            { label: "Active", value: activeCount, color: "text-yellow-600 dark:text-yellow-400" },
            { label: "Low Stock", value: lowStockCount, color: "text-red-600 dark:text-red-400" },
            { label: "On Order", value: items.filter(i => i.status === "on_order").length, color: "text-blue-600 dark:text-blue-400" },
          ].map(card => (
            <div key={card.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input type="text" placeholder="Search items or vendors..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Item Name</th>
                  <th className="px-6 py-4 font-medium">Qty / Unit</th>
                  <th className="px-6 py-4 font-medium">Min Alert</th>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Restocked</th>
                  <th className="px-6 py-4 font-medium">Added On</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-zinc-500">
                      <PackageSearch className="mx-auto h-8 w-8 opacity-20 mb-2" />
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isLow = item.quantity <= item.minStockAlert;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.itemName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-lg font-bold",
                            isLow ? "text-red-500" : "text-yellow-600 dark:text-yellow-400"
                          )}>
                            {item.quantity}
                          </span>
                          <span className="text-zinc-400 text-xs ml-1">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {item.minStockAlert} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {item.vendorName || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            item.status === "active" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            item.status === "on_order" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                            item.status === "discontinued" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          )}>
                            {STATUSES.find(s => s.value === item.status)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                          {item.lastRestocked
                            ? format(new Date(item.lastRestocked), "MMM d, yyyy")
                            : <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-xs">
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingItem(item)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletingId(item.id)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
    </>
  );
}
