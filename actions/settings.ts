"use server";

import { db } from "@/db";
import { menuItems, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

// ==============================
// MENU MANAGEMENT
// ==============================

export async function getMenuItems() {
  return await db.query.menuItems.findMany({
    orderBy: (menuItems, { asc }) => [asc(menuItems.id)]
  });
}

export async function addMenuItem(data: any) {
  try {
    await db.insert(menuItems).values(data);
    return { success: true };
  } catch (error) {
    console.error("Failed to add menu item:", error);
    return { success: false };
  }
}

export async function updateMenuItem(id: number, data: any) {
  try {
    await db.update(menuItems).set(data).where(eq(menuItems.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return { success: false };
  }
}

export async function deleteMenuItem(id: number) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { success: false };
  }
}

// ==============================
// RESTAURANT SETTINGS (GST & Auth)
// ==============================

// Ensure the settings row exists, if not, create it
async function ensureSettingsExist() {
  const existing = await db.query.settings.findFirst();
  if (!existing) {
    await db.insert(settings).values({ id: 1, gstRate: 5, adminPassword: "admin" });
  }
}

export async function getSettings() {
  await ensureSettingsExist();
  const data = await db.query.settings.findFirst();
  return data || { id: 1, gstRate: 5, cgstRate: 0, sgstRate: 0, adminPassword: "admin", upiId: null, qrCodeUrl: null };
}

import { revalidatePath } from "next/cache";

export async function updateGstRate(rate: number) {
  try {
    await ensureSettingsExist();
    await db.update(settings).set({ gstRate: rate }).where(eq(settings.id, 1));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error) {
    console.error("Failed to update GST:", error);
    return { success: false };
  }
}

export async function updateGstRates(gstRate: number, cgstRate: number, sgstRate: number) {
  try {
    await ensureSettingsExist();
    await db.update(settings).set({ gstRate, cgstRate, sgstRate }).where(eq(settings.id, 1));
    revalidatePath("/admin/settings");
    revalidatePath("/admin/billing");
    return { success: true };
  } catch (error) {
    console.error("Failed to update GST rates:", error);
    return { success: false };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    await ensureSettingsExist();
    await db.update(settings).set({ adminPassword: newPassword }).where(eq(settings.id, 1));
    return { success: true };
  } catch (error) {
    console.error("Failed to update password:", error);
    return { success: false };
  }
}

export async function updateBillingSettings(upiId: string, qrCodeUrl: string | null) {
  try {
    await ensureSettingsExist();
    await db.update(settings).set({ upiId, qrCodeUrl }).where(eq(settings.id, 1));
    return { success: true };
  } catch (error) {
    console.error("Failed to update billing settings:", error);
    return { success: false };
  }
}