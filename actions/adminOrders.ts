"use server";

import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
  try {
    const allOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
    return { success: true, orders: allOrders };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}

export async function updateOrderStatus(orderId: string, status: "active" | "completed" | "cancelled") {
  try {
    await db.update(orders)
      .set({ 
        status, 
        closedAt: status !== "active" ? new Date() : null 
      })
      .where(eq(orders.id, orderId));
      
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { success: false, error: "Failed to update order status." };
  }
}

export async function updateOrderItemStatus(itemId: number, status: "pending" | "served") {
  try {
    await db.update(orderItems)
      .set({ status })
      .where(eq(orderItems.id, itemId));
      
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to update item:", error);
    return { success: false, error: "Failed to update item status." };
  }
}
