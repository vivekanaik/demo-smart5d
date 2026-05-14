"use server";

import { db } from "@/db";
import { orders } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const result = await db
    .select({
      name: sql<string>`MAX(${orders.guestName})`,
      phone: orders.contactNumber,
      totalOrders: sql<number>`COUNT(${orders.id})::int`,
      totalSpent: sql<number>`SUM(${orders.total})::int`,
    })
    .from(orders)
    .where(sql`${orders.contactNumber} IS NOT NULL AND ${orders.contactNumber} != ''`)
    .groupBy(orders.contactNumber)
    .orderBy(sql`SUM(${orders.total}) DESC`); // Order by most spent

  return result;
}

export async function updateCustomer(oldPhone: string, newName: string, newPhone: string) {
  if (!oldPhone) return;

  await db
    .update(orders)
    .set({
      guestName: newName,
      contactNumber: newPhone,
    })
    .where(eq(orders.contactNumber, oldPhone));
    
  revalidatePath("/admin/customers");
}
