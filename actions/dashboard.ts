"use server";

import { db } from "@/db";
import { orders, orderItems, tables, reservations, inventory, users } from "@/db/schema";
import { sql, eq, gte, desc, asc, and, lt } from "drizzle-orm";

export async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  last7Days.setHours(0, 0, 0, 0);

  const last30Days = new Date();
  last30Days.setMonth(last30Days.getMonth() - 1);
  last30Days.setHours(0, 0, 0, 0);

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 2);

  try {
    // Run all queries in parallel with Promise.all for maximum speed
    const [
      [revenueToday],
      [revenueLastMonth],
      [revenuePrevMonth],
      [ordersToday],
      [ordersLastMonth],
      allTables,
      activeOrders,
      revenueChart,
      recentOrders,
      allInventory,
      upcomingReservations,
      allEmployees,
      popularDish,
      totalCustomers,
    ] = await Promise.all([
      // 1. Revenue Today
      db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)::int` })
        .from(orders)
        .where(and(gte(orders.createdAt, today), eq(orders.status, "completed"))),

      // 2. Revenue Last Month
      db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)::int` })
        .from(orders)
        .where(and(gte(orders.createdAt, last30Days), eq(orders.status, "completed"))),

      // 3. Revenue Prev Month
      db.select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)::int` })
        .from(orders)
        .where(and(gte(orders.createdAt, prevMonth), lt(orders.createdAt, last30Days), eq(orders.status, "completed"))),

      // 4. Orders Today
      db.select({ count: sql<number>`COUNT(*)::int` })
        .from(orders)
        .where(gte(orders.createdAt, today)),

      // 5. Orders Last Month
      db.select({ count: sql<number>`COUNT(*)::int` })
        .from(orders)
        .where(gte(orders.createdAt, last30Days)),

      // 6. All Tables
      db.select().from(tables),

      // 7. Active Orders (Kitchen)
      db.query.orders.findMany({
        where: eq(orders.status, "active"),
        with: { items: true },
      }),

      // 8. Revenue Chart (last 7 days)
      db.select({
          day: sql<string>`TO_CHAR(DATE_TRUNC('day', ${orders.createdAt}), 'Dy')`,
          revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)::int`,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, last7Days), eq(orders.status, "completed")))
        .groupBy(sql`DATE_TRUNC('day', ${orders.createdAt})`)
        .orderBy(sql`DATE_TRUNC('day', ${orders.createdAt})`),

      // 9. Recent Orders (last 5 completed)
      db.query.orders.findMany({
        where: eq(orders.status, "completed"),
        orderBy: [desc(orders.closedAt)],
        limit: 5,
      }),

      // 10. All Inventory
      db.select().from(inventory),

      // 11. Upcoming Reservations
      db.select({
          id: reservations.id,
          customerName: reservations.customerName,
          customerPhone: reservations.customerPhone,
          reservationTime: reservations.reservationTime,
          guestsCount: reservations.guestsCount,
          status: reservations.status,
          tableNumber: tables.tableNumber,
        })
        .from(reservations)
        .leftJoin(tables, eq(reservations.tableId, tables.id))
        .where(gte(reservations.reservationTime, today))
        .orderBy(asc(reservations.reservationTime))
        .limit(4),

      // 12. Employee Stats
      db.select({ id: users.id, status: users.status }).from(users),

      // 13. Popular Dish (30 days)
      db.select({
          name: orderItems.name,
          totalSold: sql<number>`SUM(${orderItems.quantity})::int`,
        })
        .from(orderItems)
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .where(and(gte(orders.createdAt, last30Days), eq(orders.status, "completed")))
        .groupBy(orderItems.name)
        .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
        .limit(1),

      // 14. Total Unique Customers
      db.select({ phone: orders.contactNumber })
        .from(orders)
        .where(sql`${orders.contactNumber} IS NOT NULL AND ${orders.contactNumber} != ''`)
        .groupBy(orders.contactNumber),
    ]);

    const occupiedTables = allTables.filter(t => t.status === "occupied").length;
    const reservedTables = allTables.filter(t => t.status === "reserved").length;
    const pendingKitchenItems = activeOrders.reduce(
      (sum, o) => sum + o.items.filter(i => i.status === "pending").length, 0
    );
    const kitchenTickets = activeOrders
      .filter(o => o.items.some(i => i.status === "pending"))
      .slice(0, 4);
    const lowStockItems = allInventory
      .filter(item => item.quantity <= item.minStockAlert)
      .slice(0, 5);
    const activeEmployees = allEmployees.filter(e => e.status === "active").length;

    const revenueTrend = revenuePrevMonth.total > 0
      ? ((revenueLastMonth.total - revenuePrevMonth.total) / revenuePrevMonth.total) * 100
      : 0;

    return {
      kpis: {
        revenueToday: revenueToday.total,
        revenueLastMonth: revenueLastMonth.total,
        revenueTrend: Math.round(revenueTrend),
        ordersToday: ordersToday.count,
        ordersLastMonth: ordersLastMonth.count,
        totalTables: allTables.length,
        occupiedTables,
        reservedTables,
        pendingKitchenItems,
        activeKitchenOrders: kitchenTickets.length,
        activeEmployees,
        totalEmployees: allEmployees.length,
        totalCustomers: totalCustomers.length,
        popularDish: popularDish[0]?.name ?? "N/A",
        popularDishCount: popularDish[0]?.totalSold ?? 0,
      },
      revenueChart,
      recentOrders,
      kitchenTickets,
      lowStockItems,
      upcomingReservations,
    };
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
    return null;
  }
}
