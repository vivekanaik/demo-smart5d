import { getInventory } from "@/actions/inventory";
import { InventoryPageClient } from "@/components/admin/InventoryPageClient";
import { InventoryItem } from "@/components/admin/InventoryTable";

export default async function AdminInventoryPage() {
  const result = await getInventory();
  const items = (result.success ? result.inventory : []) as InventoryItem[];

  return <InventoryPageClient initialItems={items} />;
}
