"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createTables } from "@/actions/tables";
import { useAdminLanguage } from "./AdminLanguageProvider";

export function AddTablesForm() {
  const { t } = useAdminLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [count, setCount] = useState(1);
  const [capacity, setCapacity] = useState(4);

  const handleAddTables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count < 1 || capacity < 1) return;
    
    setIsSubmitting(true);
    try {
      await createTables(count, capacity);
      setCount(1);
      setCapacity(4);
    } catch (error) {
      console.error("Failed to add tables", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleAddTables} className="flex items-center gap-2 sm:gap-3 rounded-lg border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center">
        <label htmlFor="table-count" className="sr-only">Count</label>
        <input
          id="table-count"
          type="number"
          min="1"
          max="50"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          className="w-16 rounded-md border-0 bg-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-500 dark:text-zinc-100 sm:w-20"
          placeholder="Qty"
          title="Number of tables to add"
        />
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">x</span>
      </div>
      
      <div className="flex items-center">
        <label htmlFor="table-capacity" className="sr-only">Capacity</label>
        <input
          id="table-capacity"
          type="number"
          min="1"
          max="20"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
          className="w-16 rounded-md border-0 bg-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-yellow-500 dark:text-zinc-100 sm:w-20"
          placeholder="Seats"
          title="Seats per table"
        />
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 pl-1 pr-2">Seats</span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-yellow-500 px-3 text-xs font-bold text-zinc-950 transition-colors hover:bg-yellow-400 disabled:opacity-70 sm:px-4 sm:text-sm"
      >
        {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{t("Add")}</span>
      </button>
    </form>
  );
}
