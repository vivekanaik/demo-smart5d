import { getEmployees } from "@/actions/employees";
import { getLeaveRequests, getHolidays } from "@/actions/leaves";
import { LeavesPageClient } from "@/components/admin/LeavesPageClient";

export default async function AdminLeavesPage() {
  const [empResult, leavesResult, holidaysResult] = await Promise.all([
    getEmployees(),
    getLeaveRequests(),
    getHolidays(),
  ]);

  const employees = (empResult.success ? empResult.employees ?? [] : []).map(e => ({
    id: e.id,
    name: e.name,
    role: e.role,
  }));

  const leaves = (leavesResult.success ? leavesResult.leaves ?? [] : []) as any[];
  const holidays = (holidaysResult.success ? holidaysResult.holidays ?? [] : []) as any[];

  return (
    <LeavesPageClient
      employees={employees}
      initialLeaves={leaves}
      initialHolidays={holidays}
    />
  );
}
