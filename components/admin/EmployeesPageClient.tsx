"use client";

import { useState } from "react";
import { EmployeesTable, Employee } from "@/components/admin/EmployeesTable";
import { Users, CheckCircle, AlertTriangle } from "lucide-react";

export function EmployeesPageClient({ employees }: { employees: Employee[] }) {
  const [showAdd, setShowAdd] = useState(false);

  const now = new Date();
  const paidCount = employees.filter(e => {
    if (!e.salaryPaidAt) return false;
    const paid = new Date(e.salaryPaidAt);
    return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
  }).length;
  const dueCount = employees.filter(e => e.salary).length - paidCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Staff Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage employees, roles, salaries and access.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Total Staff</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">{employees.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Active</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400 sm:text-3xl">{employees.filter(e => e.status === "active").length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Salary Paid</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400 sm:text-3xl">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-4">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Salary Due</p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400 sm:text-3xl">{dueCount}</p>
        </div>
      </div>

      <EmployeesTable initialEmployees={employees} onAdd={() => setShowAdd(true)} showAddModal={showAdd} onCloseAdd={() => setShowAdd(false)} />
    </div>
  );
}
