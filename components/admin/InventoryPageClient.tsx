"use client";

import { useState } from "react";
import { InventoryTable, InventoryItem } from "@/components/admin/InventoryTable";
import { Plus } from "lucide-react";

export function InventoryPageClient({ initialItems }: { initialItems: InventoryItem[] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Inventory Control</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track raw materials, stock levels and suppliers.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <InventoryTable
        initialItems={initialItems}
        showAddModal={showAdd}
        onCloseAdd={() => setShowAdd(false)}
      />
    </div>
  );
}
