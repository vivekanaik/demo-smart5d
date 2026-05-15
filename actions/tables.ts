"use server";

import { db } from "@/db";
import { tables, reservations } from "@/db/schema";
import { asc, desc, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTables() {
  try {
    return await db.select().from(tables).orderBy(asc(tables.tableNumber));
  } catch {
    return [];
  }
}

export async function createTables(count: number, capacity: number) {
  // Get current max table number
  const existingTables = await db.select().from(tables).orderBy(desc(tables.tableNumber)).limit(1);
  const maxTableNumber = existingTables.length > 0 ? existingTables[0].tableNumber : 0;

  const newTables = Array.from({ length: count }, (_, i) => ({
    tableNumber: maxTableNumber + i + 1,
    capacity,
    status: "available" as const,
  }));

  await db.insert(tables).values(newTables);
  revalidatePath("/admin/tables");
}

export async function getUpcomingReservations() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    return await db
      .select({
        id: reservations.id,
        customerName: reservations.customerName,
        customerPhone: reservations.customerPhone,
        tableId: reservations.tableId,
        tableNumber: tables.tableNumber,
        reservationTime: reservations.reservationTime,
        guestsCount: reservations.guestsCount,
        status: reservations.status,
      })
      .from(reservations)
      .leftJoin(tables, eq(reservations.tableId, tables.id))
      .where(gte(reservations.reservationTime, today))
      .orderBy(asc(reservations.reservationTime));
  } catch {
    return [];
  }
}

export async function createReservation(data: {
  customerName: string;
  customerPhone: string;
  tableId: number;
  reservationTime: Date;
  guestsCount: number;
}) {
  await db.insert(reservations).values({
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    tableId: data.tableId,
    reservationTime: data.reservationTime,
    guestsCount: data.guestsCount,
    status: "pending",
  });

  // Revalidate the tables page
  revalidatePath("/admin/tables");
}

export async function updateTable(
  tableId: number, 
  data: { tableNumber?: number; capacity?: number; status?: "available" | "occupied" | "reserved" | "maintenance" }
) {
  await db.update(tables).set(data).where(eq(tables.id, tableId));
  revalidatePath("/admin/tables");
}

export async function deleteTable(tableId: number) {
  await db.delete(tables).where(eq(tables.id, tableId));
  revalidatePath("/admin/tables");
}
