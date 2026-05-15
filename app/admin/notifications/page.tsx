import { getAdminRole } from "@/actions/adminAuth";
import { safeQuery } from "@/lib/safe-query";
import React from "react";
import NotificationsClient from "./NotificationsClient";

export const metadata = {
  title: "Notifications | Admin Dashboard",
};

export default async function NotificationsPage() {
  const role = await safeQuery(() => getAdminRole(), "waiter" as const);
  return <NotificationsClient role={role || "waiter"} />;
}
