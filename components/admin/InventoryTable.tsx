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
import { useAdminLanguage } from "@/components/admin/AdminLanguageProvider";

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
  const { t } = useAdminLanguage();
  const inputCls = "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Item Name")} *</label>
          <input type="text" placeholder={t("e.g. Basmati Rice")} value={form.itemName}
            onChange={(e) => setForm((f: any) => ({ ...f, itemName: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Quantity")} *</label>
          <input type="number" min="0" placeholder="0" value={form.quantity}
            onChange={(e) => setForm((f: any) => ({ ...f, quantity: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Unit")} *</label>
          <select value={form.unit} onChange={(e) => setForm((f: any) => ({ ...f, unit: e.target.value }))}
            className={`admin-select ${inputCls}`}>
            <option value="">{t("Select unit")}</option>
            {UNITS.map(u => <option key={u} value={u}>{t(u)}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Min Stock Alert")}</label>
          <input type="number" min="0" placeholder="10" value={form.minStockAlert}
            onChange={(e) => setForm((f: any) => ({ ...f, minStockAlert: e.target.value }))}
            className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Status")}</label>
          <select value={form.status} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
            className={`admin-select ${inputCls}`}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t("Vendor / Supplier")}</label>
          <input type="text" placeholder={t("e.g. Metro Cash & Carry")} value={form.vendorName}
            onChange={(e) => setForm((f: any) => ({ ...f, vendorName: e.target.value }))}
            className={inputCls} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {t("Last Restocked Date")}
          </label>
          <input type="date" value={form.lastRestocked}
            onChange={(e) => setForm((f: any) => ({ ...f, lastRestocked: e.target.value }))}
            className={inputCls} />
          <p className="text-xs text-zinc-400 mt-1">{t("Leave empty if not yet restocked.")}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddInventoryModal({ onClose }: { onClose: () => void }) {
  const { t } = useAdminLanguage();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    itemName: "", quantity: "", unit: "", minStockAlert: "10",
    vendorName: "", status: "active", lastRestocked: "",
  });

  const handleSubmit = () => {
    if (!form.itemName || !form.quantity || !form.unit) {
      setError(t("Item name, quantity and unit are required."));
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
      else setError(t(res.error || "Failed to add item."));
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t("Add Inventory Item")}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <InventoryForm form={form} setForm={setForm} error={error} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            {t("Cancel")}
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {isPending ? t("Adding...") : t("Add Item")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditInventoryModal({ item, onClose, onUpdate }: { item: InventoryItem; onClose: () => void; onUpdate: (id: number, data: Partial<InventoryItem>) => void }) {
  const { t } = useAdminLanguage();
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
        setError(t(res.error || "Failed to update."));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t("Edit Item")}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="mb-4 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          {t("Added on")} <span className="font-medium text-zinc-700 dark:text-zinc-300">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
        </div>

        <InventoryForm form={form} setForm={setForm} error={error} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            {t("Cancel")}
          </button>
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? t("Saving...") : t("Save Changes")}
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
  const { t } = useAdminLanguage();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = items.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch = item.itemName.toLowerCase().includes(query) ||
      t(item.itemName).toLowerCase().includes(query) ||
      item.unit.toLowerCase().includes(query) ||
      t(item.unit).toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      t(STATUSES.find(s => s.value === item.status)?.label ?? item.status).toLowerCase().includes(query) ||
      (item.vendorName || "").toLowerCase().includes(query);
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
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t("Delete Item?")}</h3>
            <p className="text-sm text-zinc-500 mb-6">{t("This will permanently remove the item from your inventory.")}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                {t("Cancel")}
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60">
                {isPending ? t("Deleting...") : t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: "Total Items", value: items.length, color: "text-zinc-900 dark:text-zinc-100" },
            { label: "Active", value: activeCount, color: "text-yellow-600 dark:text-yellow-400" },
            { label: "Low Stock", value: lowStockCount, color: "text-red-600 dark:text-red-400" },
            { label: "On Order", value: items.filter(i => i.status === "on_order").length, color: "text-blue-600 dark:text-blue-400" },
          ].map(card => (
            <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t(card.label)}</p>
              <p className={`mt-1 text-2xl font-bold sm:text-3xl ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input type="text" placeholder={t("Search items or vendors...")}
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100" />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:w-auto">
              <option value="all">{t("All Statuses")}</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{t(s.label)}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">{t("Item Name")}</th>
                  <th className="px-6 py-4 font-medium">{t("Qty / Unit")}</th>
                  <th className="px-6 py-4 font-medium">{t("Min Alert")}</th>
                  <th className="px-6 py-4 font-medium">{t("Vendor")}</th>
                  <th className="px-6 py-4 font-medium">{t("Status")}</th>
                  <th className="px-6 py-4 font-medium">{t("Last Restocked")}</th>
                  <th className="px-6 py-4 font-medium">{t("Added On")}</th>
                  <th className="px-6 py-4 font-medium text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center text-zinc-500">
                      <PackageSearch className="mx-auto h-8 w-8 opacity-20 mb-2" />
                      {t("No inventory items found.")}
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
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{t(item.itemName)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-lg font-bold",
                            isLow ? "text-red-500" : "text-yellow-600 dark:text-yellow-400"
                          )}>
                            {item.quantity}
                          </span>
                          <span className="text-zinc-400 text-xs ml-1">{t(item.unit)}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                          {item.minStockAlert} {t(item.unit)}
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
                            {t(STATUSES.find(s => s.value === item.status)?.label ?? item.status)}
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

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 md:hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-zinc-500">
                <PackageSearch className="mx-auto mb-2 h-8 w-8 opacity-20" />
                {t("No inventory items found.")}
              </div>
            ) : (
              filtered.map((item) => {
                const isLow = item.quantity <= item.minStockAlert;
                return (
                  <div key={item.id} className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />}
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{t(item.itemName)}</p>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {item.vendorName || t("No vendor")}
                        </p>
                      </div>
                      <span className={cn(
                        "inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        item.status === "active" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                        item.status === "on_order" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                        item.status === "discontinued" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      )}>
                        {t(STATUSES.find(s => s.value === item.status)?.label ?? item.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Quantity")}</p>
                        <p className={cn(
                          "mt-1 text-lg font-bold",
                          isLow ? "text-red-500" : "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {item.quantity} <span className="text-xs font-normal text-zinc-400">{t(item.unit)}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Min Alert")}</p>
                        <p className="mt-1 text-zinc-900 dark:text-zinc-100">{item.minStockAlert} {t(item.unit)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Last Restocked")}</p>
                        <p className="mt-1 text-zinc-700 dark:text-zinc-300">
                          {item.lastRestocked ? format(new Date(item.lastRestocked), "MMM d, yyyy") : t("N/A")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t("Added On")}</p>
                        <p className="mt-1 text-zinc-700 dark:text-zinc-300">{format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingItem(item)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
                        <Pencil className="h-4 w-4" />
                        {t("Edit")}
                      </button>
                      <button onClick={() => setDeletingId(item.id)}
                        className="inline-flex items-center justify-center rounded-md border border-zinc-200 px-3 py-2 text-red-500 transition-colors hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
