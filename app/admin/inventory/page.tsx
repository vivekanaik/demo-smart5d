import { getInventory } from "@/actions/inventory";
import { InventoryPageClient } from "@/components/admin/InventoryPageClient";
import { InventoryItem } from "@/components/admin/InventoryTable";
import { safeQuery } from "@/lib/safe-query";
import { OfflineFallback } from "@/components/admin/OfflineFallback";

export default async function AdminInventoryPage() {
  const result = await safeQuery(() => getInventory(), { success: false as const, inventory: [] as InventoryItem[] });
  const items = (result.success ? result.inventory ?? [] : []) as InventoryItem[];

  if (!result.success) {
    return <OfflineFallback title="Inventory Unavailable" description="Inventory data couldn't be loaded. Please connect to the internet to load and sync it first." />;
  }

  return <InventoryPageClient initialItems={items} />;
}
