"use server";

import { db } from "@/db";
import { menuItems, tables, orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPOSData() {
  try {
    const allItems = await db.query.menuItems.findMany({
      where: eq(menuItems.isAvailable, 1),
    });
    
    const allTables = await db.query.tables.findMany({
      where: eq(tables.status, "available"),
    });

    return { success: true, items: allItems, tables: allTables };
  } catch (error) {
    console.error("Failed to fetch POS data:", error);
    return { success: false, error: "Failed to fetch data." };
  }
}

export async function createOrder(data: {
  guestName: string;
  tableNumber: string;
  total: number;
  items: { id: number; name: string; price: number; quantity: number }[];
}) {
  try {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    await db.transaction(async (tx) => {
      // 1. Create Order
      await tx.insert(orders).values({
        id: orderId,
        guestName: data.guestName,
        tableNumber: data.tableNumber,
        total: data.total,
        status: "active",
      });

      // 2. Create Order Items
      const itemsToInsert = data.items.map(item => ({
        orderId,
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        status: "pending" as const,
      }));

      await tx.insert(orderItems).values(itemsToInsert);
      
      // 3. Update Table Status to occupied
      await tx.update(tables)
        .set({ status: "occupied" })
        .where(eq(tables.tableNumber, parseInt(data.tableNumber)));
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/pos");
    revalidatePath("/admin/tables");
    
    return { success: true, orderId };
  } catch (error) {
    console.error("Failed to create order:", error);
    return { success: false, error: "Failed to create order." };
  }
}
