import { getAdminOrders } from "@/actions/adminOrders";
import AdminOrdersClient from "./AdminOrdersClient";
import type { Order } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const result = await getAdminOrders();
  const initialOrders = (result.success && result.orders ? result.orders : []) as Order[];

  return <AdminOrdersClient initialOrders={initialOrders} />;
}
