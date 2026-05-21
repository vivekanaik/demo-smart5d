import { getTables, getUpcomingReservations } from "@/actions/tables";
import { safeQuery } from "@/lib/safe-query";
import { AdminTablesClient } from "./AdminTablesClient";

export default async function AdminTablesPage() {
  const tables = await safeQuery(() => getTables(), [] as any[]);
  const reservations = await safeQuery(() => getUpcomingReservations(), [] as any[]);

  return (
    <AdminTablesClient initialTables={tables} initialReservations={reservations} />
  );
}
