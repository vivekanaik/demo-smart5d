"use server";

import { cookies } from "next/headers";

export type AdminRole = "owner" | "manager" | "waiter";

export async function adminLogin(password: string): Promise<{ success: boolean; role?: AdminRole; message?: string }> {
  const ownerPassword = process.env.ADMIN_OWNER_PASSWORD;
  const managerPassword = process.env.ADMIN_MANAGER_PASSWORD;
  const waiterPassword = process.env.ADMIN_WAITER_PASSWORD;

  let role: AdminRole | null = null;

  if (ownerPassword && password === ownerPassword) {
    role = "owner";
  } else if (managerPassword && password === managerPassword) {
    role = "manager";
  } else if (waiterPassword && password === waiterPassword) {
    role = "waiter";
  }

  if (!role) {
    return { success: false, message: "Incorrect password." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true, role };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get("admin_auth")?.value;
  if (value === "owner" || value === "manager" || value === "waiter") {
    return value;
  }
  return null;
}
