"use client";

import { useState } from "react";
import { Users, Edit2, Trash2, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTable, deleteTable } from "@/actions/tables";
import { useAdminLanguage } from "./AdminLanguageProvider";

type Table = {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
};

export function TableCard({ table }: { table: Table }) {
  const { t } = useAdminLanguage();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: table.status as "available" | "occupied" | "reserved" | "maintenance",
  });

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteTable(table.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Failed to delete table:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await updateTable(table.id, formData);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update table:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "group relative flex min-h-32 flex-col items-center justify-center space-y-2 rounded-xl border p-3 text-center transition-all sm:p-4",
          table.status === "available" && "bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800",
          table.status === "occupied" && "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50",
          table.status === "reserved" && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50",
          table.status === "maintenance" && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50",
        )}
      >
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button 
            onClick={() => setIsEditOpen(true)} 
            className="p-1.5 text-zinc-500 hover:text-yellow-600 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-yellow-500 rounded shadow-sm transition-colors"
            title="Edit Table"
          >
            <Edit2 size={10} />
          </button>
          <button 
            onClick={() => setIsDeleteOpen(true)} 
            className="p-1.5 text-zinc-500 hover:text-red-600 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-red-500 rounded shadow-sm transition-colors"
            title="Delete Table"
          >
            <Trash2 size={10} />
          </button>
        </div>

        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{table.tableNumber}</div>
        <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
          <Users className="h-3 w-3" />
          {table.capacity} Seats
        </div>
        <div className={cn(
          "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
          table.status === "available" && "text-zinc-500 bg-zinc-100 dark:bg-zinc-900",
          table.status === "occupied" && "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50",
          table.status === "reserved" && "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50",
          table.status === "maintenance" && "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"
        )}>
          {table.status}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Table {table.tableNumber}?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              This action cannot be undone. Any active reservations for this table might be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isProcessing}
                className="flex-1 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/60">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Edit Table {table.tableNumber}</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={isProcessing}
                className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Table Number</label>
                    <input
                      type="number"
                      required
                      value={isNaN(formData.tableNumber) ? "" : formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: parseInt(e.target.value, 10) })}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Seats</label>
                    <input
                      type="number"
                      required
                      value={isNaN(formData.capacity) ? "" : formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-yellow-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2.5 text-sm font-bold text-zinc-950 hover:bg-yellow-400 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Confirm Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
