"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Users, Armchair, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewBookingButton } from "@/components/admin/NewBookingButton";
import { AddTablesForm } from "@/components/admin/AddTablesForm";
import { TableCard } from "@/components/admin/TableCard";
import { getTables, getUpcomingReservations } from "@/actions/tables";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getDb } from "@/lib/db-local";

export function AdminTablesClient({
  initialTables,
  initialReservations,
}: {
  initialTables: any[];
  initialReservations: any[];
}) {
  const [tables, setTables] = useState<any[]>(initialTables);
  const [reservations, setReservations] = useState<any[]>(initialReservations);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOnline = useNetworkStatus();

  const fetchTablesData = useCallback(async () => {
    setIsRefreshing(true);
    
    if (!isOnline) {
      try {
        const db = await getDb();
        if (db) {
          const localTables = await db.table('tables').toArray();
          const localReservations = await db.table('reservations').toArray();
          setTables(localTables);
          setReservations(localReservations);
        }
      } catch (err) {
        console.error("Offline read failed", err);
      }
    } else {
      try {
        const [fetchedTables, fetchedReservations] = await Promise.all([
          getTables(),
          getUpcomingReservations()
        ]);
        
        setTables(fetchedTables);
        setReservations(fetchedReservations);
        
        // Cache for offline
        const db = await getDb();
        if (db) {
          await db.table('tables').clear();
          await db.table('tables').bulkAdd(fetchedTables);
          
          await db.table('reservations').clear();
          await db.table('reservations').bulkAdd(fetchedReservations);
        }
      } catch (error) {
        console.error("Failed to fetch tables data online", error);
      }
    }
    
    setIsRefreshing(false);
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      // Just cache on mount if online, or load offline cache if no initial data
      fetchTablesData();
    }
  }, [isOnline, fetchTablesData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Tables & Reservations</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Live floor plan and upcoming bookings.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchTablesData}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </button>
          <div className="flex-1 sm:flex-none">
            <NewBookingButton tables={tables} onRefresh={fetchTablesData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Floor Plan Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Armchair className="h-5 w-5 text-yellow-500" />
              Floor Plan
            </h3>
            <AddTablesForm />
          </div>
          
          {tables?.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
              <Armchair className="mb-3 h-10 w-10 text-zinc-400 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No tables on the floor</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Use the form above to add tables to your floor plan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 sm:gap-4">
              {tables?.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
          </div>
          )}
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
