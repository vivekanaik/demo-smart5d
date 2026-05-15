"use server";

import { db } from "@/db";
import { leaveRequests, holidays, users } from "@/db/schema";
import { desc, gte, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getLeaveRequests() {
  try {
    const leaves = await db.query.leaveRequests.findMany({
      orderBy: [desc(leaveRequests.createdAt)],
      with: { user: { columns: { name: true, role: true } } },
    });
    return { success: true, leaves };
  } catch (error) {
    console.warn("Failed to fetch leave requests:");
    return { success: false, error: "Failed to fetch leave requests." };
  }
}

export async function addLeaveRequest(data: {
  userId: number;
  leaveType: "sick" | "casual" | "earned" | "unpaid";
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  try {
    await db.insert(leaveRequests).values(data);
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (error) {
    console.warn("Failed to add leave request:");
    return { success: false, error: "Failed to submit leave request." };
  }
}

export async function updateLeaveStatus(
  id: number,
  status: "pending" | "approved" | "rejected"
) {
  try {
    await db.update(leaveRequests).set({ status }).where(eq(leaveRequests.id, id));
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (error) {
    console.warn("Failed to update leave status:");
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteLeaveRequest(id: number) {
  try {
    await db.delete(leaveRequests).where(eq(leaveRequests.id, id));
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (error) {
    console.warn("Failed to delete leave request:");
    return { success: false, error: "Failed to delete leave request." };
  }
}

// ─── Holidays ─────────────────────────────────────────────────────────────────

export async function getHolidays() {
  try {
    const all = await db.query.holidays.findMany({
      orderBy: [holidays.date],
    });
    return { success: true, holidays: all };
  } catch (error) {
    console.warn("Failed to fetch holidays:");
    return { success: false, error: "Failed to fetch holidays." };
  }
}

export async function addHoliday(data: {
  name: string;
  date: string;
  type: "national" | "festival" | "optional";
}) {
  try {
    await db.insert(holidays).values(data);
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (error) {
    console.warn("Failed to add holiday:");
    return { success: false, error: "Failed to add holiday." };
  }
}

export async function deleteHoliday(id: number) {
  try {
    await db.delete(holidays).where(eq(holidays.id, id));
    revalidatePath("/admin/leaves");
    return { success: true };
  } catch (error) {
    console.warn("Failed to delete holiday:");
    return { success: false, error: "Failed to delete holiday." };
  }
}
