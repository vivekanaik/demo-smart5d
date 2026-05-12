"use server";

import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActiveKitchenOrders() {
  try {
    // Fetch only active orders
    const activeOrders = await db.query.orders.findMany({
      where: eq(orders.status, "active"),
      orderBy: [asc(orders.createdAt)], // Oldest first for kitchen priority
      with: {
        items: true,
      },
    });

    // Filter to only include orders that have at least one 'pending' item
    const kitchenTickets = activeOrders.filter(order => 
      order.items.some(item => item.status === "pending")
    );

    return { success: true, tickets: kitchenTickets };
  } catch (error) {
    console.error("Failed to fetch kitchen orders:", error);
    return { success: false, error: "Failed to fetch kitchen orders." };
  }
}

export async function markItemServed(itemId: number) {
  try {
    await db.update(orderItems)
      .set({ status: "served" })
      .where(eq(orderItems.id, itemId));
      
    revalidatePath("/admin/kitchen");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark item served:", error);
    return { success: false, error: "Failed to update item." };
  }
}
