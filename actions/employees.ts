"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
  try {
    const allEmployees = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
    const safeEmployees = allEmployees.map(({ passwordHash, ...rest }) => rest);
    return { success: true, employees: safeEmployees };
  } catch (error) {
    console.warn("Failed to fetch employees:");
    return { success: false, error: "Failed to fetch employees." };
  }
}

export async function addEmployee(data: {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "cashier" | "chef";
  salary?: number;
  status: "active" | "inactive" | "on_leave";
}) {
  try {
    await db.insert(users).values({
      ...data,
      passwordHash: "changeme123", // default password
    });
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    console.warn("Failed to add employee:");
    if (error?.message?.includes("unique")) {
      return { success: false, error: "An employee with this email already exists." };
    }
    return { success: false, error: "Failed to add employee." };
  }
}

export async function updateEmployee(
  id: number,
  data: { name?: string; salary?: number; status?: "active" | "inactive" | "on_leave"; role?: "admin" | "manager" | "cashier" | "chef"; phone?: string }
) {
  try {
    await db.update(users).set(data).where(eq(users.id, id));
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.warn("Failed to update employee:");
    return { success: false, error: "Failed to update employee." };
  }
}

export async function deleteEmployee(id: number) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.warn("Failed to delete employee:");
    return { success: false, error: "Failed to delete employee." };
  }
}

export async function markSalaryPaid(id: number) {
  try {
    await db.update(users).set({ salaryPaidAt: new Date() }).where(eq(users.id, id));
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.warn("Failed to mark salary paid:");
    return { success: false, error: "Failed to update salary status." };
  }
}

export async function resetSalaryPaid(id: number) {
  try {
    await db.update(users).set({ salaryPaidAt: null }).where(eq(users.id, id));
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.warn("Failed to reset salary:");
    return { success: false, error: "Failed to undo salary payment." };
  }
}
