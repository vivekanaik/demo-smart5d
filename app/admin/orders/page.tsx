import { getAdminOrders } from "@/actions/adminOrders";
import AdminOrdersClient from "./AdminOrdersClient";
import type { Order } from "@/components/admin/OrdersTable";
import { safeQuery } from "@/lib/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const result = await safeQuery(() => getAdminOrders(), { success: false, orders: [] });
  const initialOrders = (result.success && result.orders ? result.orders : []) as Order[];

  return <AdminOrdersClient initialOrders={initialOrders} />;
}
