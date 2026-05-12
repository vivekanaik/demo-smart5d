"use server";

import { db } from "@/db";
import { tables, reservations } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export async function getTablesAndReservations() {
  try {
    const allTables = await db.query.tables.findMany({
      orderBy: [asc(tables.tableNumber)],
    });
    
    const allReservations = await db.query.reservations.findMany({
      orderBy: [desc(reservations.reservationTime)],
      with: {
        table: true
      }
    });

    return { success: true, tables: allTables, reservations: allReservations };
  } catch (error) {
    console.error("Failed to fetch tables data:", error);
    return { success: false, error: "Failed to fetch tables." };
  }
}
