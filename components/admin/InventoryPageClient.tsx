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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Inventory Control</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track raw materials, stock levels and suppliers.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
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
