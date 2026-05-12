"use server";

import { db } from "@/db";
import { inventory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInventory() {
  try {
    const items = await db.query.inventory.findMany({
      orderBy: [desc(inventory.createdAt)],
    });
    return { success: true, inventory: items };
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return { success: false, error: "Failed to fetch inventory." };
  }
}

export async function addInventoryItem(data: {
  itemName: string;
  quantity: number;
  unit: string;
  minStockAlert: number;
  vendorName?: string;
  status: "active" | "discontinued" | "on_order";
  lastRestocked?: Date;
}) {
  try {
    await db.insert(inventory).values(data);
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to add inventory item:", error);
    return { success: false, error: "Failed to add item." };
  }
}

export async function updateInventoryItem(
  id: number,
  data: {
    itemName?: string;
    quantity?: number;
    unit?: string;
    minStockAlert?: number;
    vendorName?: string;
    status?: "active" | "discontinued" | "on_order";
    lastRestocked?: Date | null;
  }
) {
  try {
    await db.update(inventory).set(data).where(eq(inventory.id, id));
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to update inventory item:", error);
    return { success: false, error: "Failed to update item." };
  }
}

export async function deleteInventoryItem(id: number) {
  try {
    await db.delete(inventory).where(eq(inventory.id, id));
    revalidatePath("/admin/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return { success: false, error: "Failed to delete item." };
  }
}
