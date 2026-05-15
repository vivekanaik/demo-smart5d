import { getEmployees } from "@/actions/employees";
import { Employee } from "@/components/admin/EmployeesTable";
import { EmployeesPageClient } from "@/components/admin/EmployeesPageClient";
import { safeQuery } from "@/lib/safe-query";
import { OfflineFallback } from "@/components/admin/OfflineFallback";

export default async function AdminEmployeesPage() {
  const result = await safeQuery(() => getEmployees(), { success: false as const, employees: [] as Employee[] });
  const employees = (result.success ? result.employees ?? [] : []) as Employee[];

  if (!result.success) {
    return <OfflineFallback title="Staff Unavailable" description="Employee data couldn't be loaded. Please connect to the internet to load and sync it first." />;
  }

  return <EmployeesPageClient employees={employees} />;
}
