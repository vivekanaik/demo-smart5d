import { getTablesAndReservations } from "@/actions/tables";
import { format } from "date-fns";
import { Users, Armchair, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminTablesPage() {
  const result = await getTablesAndReservations();
  const tables = result.success ? result.tables : [];
  const reservations = result.success ? result.reservations : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Tables & Reservations</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Live floor plan and upcoming bookings.</p>
        </div>
        
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700 sm:w-auto">
          <Plus className="h-4 w-4" />
          New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Plan Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Armchair className="h-5 w-5 text-yellow-500" />
            Floor Plan
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 sm:gap-4">
            {tables?.map((table) => (
              <div 
                key={table.id}
                className={cn(
                  "flex min-h-32 flex-col items-center justify-center space-y-2 rounded-xl border p-3 text-center transition-all sm:p-4",
                  table.status === "available" && "bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 hover:border-yellow-500",
                  table.status === "occupied" && "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50",
                  table.status === "reserved" && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/50",
                  table.status === "maintenance" && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50"
                )}
              >
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{table.tableNumber}</div>
                <div className="flex items-center gap-1 text-xs font-medium text-zinc-500">
                  <Users className="h-3 w-3" />
                  {table.capacity} Seats
                </div>
                <div className={cn(
                  "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                  table.status === "available" && "text-zinc-500 bg-zinc-100 dark:bg-zinc-900",
                  table.status === "occupied" && "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50",
                  table.status === "reserved" && "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50",
                  table.status === "maintenance" && "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"
                )}>
                  {table.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reservations List */}
        <div className="lg:col-span-1 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Upcoming Bookings</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px]">
            {reservations?.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No upcoming reservations.</p>
            ) : (
              reservations?.map((res: any) => (
                <div key={res.id} className="p-3 rounded-lg border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{res.customerName}</p>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      Table {res.table?.tableNumber || "TBD"}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                    <p>{format(new Date(res.reservationTime), "MMM d, yyyy • h:mm a")}</p>
                    <p className="flex items-center gap-1"><Users className="h-3 w-3" /> {res.guestsCount} Guests</p>
                    <p>{res.customerPhone}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
