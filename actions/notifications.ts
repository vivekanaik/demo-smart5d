"use server";

import { db } from "@/db";
import { serviceRequests, inventory, reservations, orders, leaveRequests, users } from "@/db/schema";
import { eq, or, lte, and, gte, sql } from "drizzle-orm";

export type NotificationType = "service" | "inventory" | "booking" | "payment" | "leave";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  link: string;
  isResolvable: boolean;
  dbId?: number | string; // For resolving if applicable
}

export async function getDynamicNotifications(): Promise<NotificationItem[]> {
  const notifications: NotificationItem[] = [];

  try {
    // 1. Service Requests (Waiters)
    const pendingRequests = await db.select().from(serviceRequests).where(eq(serviceRequests.status, "pending"));
    
    pendingRequests.forEach((req) => {
      notifications.push({
        id: `service-${req.id}`,
        type: "service",
        title: `Table ${req.tableNumber} Assistance`,
        message: "Customer requested a waiter.",
        timestamp: req.createdAt.toISOString(),
        link: "/admin/tables",
        isResolvable: true,
        dbId: req.id,
      });
    });

    // 2. Inventory Alerts
    const lowStockItems = await db.select().from(inventory);
    
    lowStockItems.forEach((item) => {
      if (item.quantity <= item.minStockAlert) {
        notifications.push({
          id: `inventory-${item.id}`,
          type: "inventory",
          title: `Low Stock: ${item.itemName}`,
          message: `Only ${item.quantity} ${item.unit} left. Min stock is ${item.minStockAlert}.`,
          timestamp: new Date().toISOString(), // Inventory alert is current
          link: "/admin/inventory",
          isResolvable: false,
        });
      }
    });

    // 3. Upcoming Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeReservations = await db.select()
      .from(reservations)
      .where(
        and(
          or(eq(reservations.status, "pending"), eq(reservations.status, "confirmed")),
          gte(reservations.reservationTime, today)
        )
      );

    activeReservations.forEach((res) => {
      const resTime = new Date(res.reservationTime);
      const timeStr = resTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      notifications.push({
        id: `booking-${res.id}`,
        type: "booking",
        title: `Booking at ${timeStr}`,
        message: `${res.customerName} - Party of ${res.guestsCount}.`,
        timestamp: res.createdAt.toISOString(), // Or reservationTime? Usually we sort by creation or urgency. Let's use reservationTime to show when it's happening.
        link: "/admin/tables",
        isResolvable: false,
      });
    });

    // 4. Payment Due (Active Orders)
    const activeOrders = await db.select().from(orders).where(eq(orders.status, "active"));
    
    activeOrders.forEach((order) => {
      notifications.push({
        id: `payment-${order.id}`,
        type: "payment",
        title: `Payment Due: Table ${order.tableNumber}`,
        message: `Order for ${order.guestName} is active. Total: ₹${order.total}`,
        timestamp: order.createdAt.toISOString(),
        link: `/admin/billing`,
        isResolvable: false,
      });
    });

    // 5. Leave Notifications — Today & Tomorrow
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const todayStr = todayStart.toISOString().slice(0, 10);
    const tomorrowStr = tomorrowStart.toISOString().slice(0, 10);

    // Fetch approved leaves that overlap today or tomorrow
    const leavesRaw = await db
      .select({
        id: leaveRequests.id,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        leaveType: leaveRequests.leaveType,
        userName: users.name,
        createdAt: leaveRequests.createdAt,
      })
      .from(leaveRequests)
      .innerJoin(users, eq(leaveRequests.userId, users.id))
      .where(
        and(
          eq(leaveRequests.status, "approved"),
          lte(sql`${leaveRequests.startDate}::date`, tomorrowStr),
          gte(sql`${leaveRequests.endDate}::date`, todayStr)
        )
      );

    leavesRaw.forEach((leave) => {
      const start = leave.startDate;
      const end = leave.endDate;
      const isToday = start <= todayStr && end >= todayStr;
      const isTomorrow = start <= tomorrowStr && end >= tomorrowStr && !isToday;

      if (isToday) {
        notifications.push({
          id: `leave-today-${leave.id}`,
          type: "leave",
          title: `${leave.userName} on Leave Today`,
          message: `${leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} leave until ${new Date(end + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
          timestamp: leave.createdAt.toISOString(),
          link: "/admin/leaves",
          isResolvable: false,
        });
      } else if (isTomorrow) {
        notifications.push({
          id: `leave-tomorrow-${leave.id}`,
          type: "leave",
          title: `${leave.userName} on Leave Tomorrow`,
          message: `${leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} leave from ${new Date(start + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
          timestamp: leave.createdAt.toISOString(),
          link: "/admin/leaves",
          isResolvable: false,
        });
      }
    });

  } catch (error) {
    console.error("Error fetching dynamic notifications:", error);
  }

  // Sort by timestamp descending (newest first) by default
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
