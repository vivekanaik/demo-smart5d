import React from "react";
import NotificationsClient from "./NotificationsClient";
import { getAdminRole } from "@/actions/adminAuth";

export const metadata = {
  title: "Notifications | Admin Dashboard",
};

export default async function NotificationsPage() {
  const role = await getAdminRole();
  return <NotificationsClient role={role || "waiter"} />;
}
