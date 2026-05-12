"use client";

import { useState } from "react";
import { EmployeesTable, Employee } from "@/components/admin/EmployeesTable";
import { Plus, Users, CheckCircle, Clock, AlertTriangle } from "lucide-react";

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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Staff Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage employees, roles, salaries and access.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Total Staff</p>
          <p className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100">{employees.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Active</p>
          <p className="text-3xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{employees.filter(e => e.status === "active").length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Salary Paid</p>
          <p className="text-3xl font-bold mt-1 text-green-600 dark:text-green-400">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Salary Due</p>
          <p className="text-3xl font-bold mt-1 text-red-600 dark:text-red-400">{dueCount}</p>
        </div>
      </div>

      <EmployeesTable initialEmployees={employees} onAdd={() => setShowAdd(true)} showAddModal={showAdd} onCloseAdd={() => setShowAdd(false)} />
    </div>
  );
}
