import { getEmployees } from "@/actions/employees";
import { Employee } from "@/components/admin/EmployeesTable";
import { EmployeesPageClient } from "@/components/admin/EmployeesPageClient";

export default async function AdminEmployeesPage() {
  const result = await getEmployees();
  const employees = (result.success ? result.employees : []) as Employee[];

  return <EmployeesPageClient employees={employees} />;
}
