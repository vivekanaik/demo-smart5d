"use server";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getCustomers() {
  try {
    const allCustomers = await db.query.customers.findMany({
      orderBy: [desc(customers.totalSpent)],
    });
    return { success: true, customers: allCustomers };
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return { success: false, error: "Failed to fetch customers." };
  }
}
