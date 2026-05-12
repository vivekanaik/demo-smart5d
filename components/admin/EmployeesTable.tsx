"use client";

import { useState, useTransition } from "react";
import {
  Search, Filter, UserCog, Plus, Trash2, Pencil, CheckCircle, Clock, X, Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addEmployee, updateEmployee, deleteEmployee, markSalaryPaid, resetSalaryPaid
} from "@/actions/employees";

export type Employee = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "chef";
  phone: string | null;
  salary: number | null;
  status: "active" | "inactive" | "on_leave";
  salaryPaidAt: Date | null;
  createdAt: Date;
};

const ROLES = ["admin", "manager", "cashier", "chef"] as const;
const STATUSES = ["active", "inactive", "on_leave"] as const;

function isSalaryPaidThisMonth(paidAt: Date | null): boolean {
  if (!paidAt) return false;
  const paid = new Date(paidAt);
  const now = new Date();
  return paid.getMonth() === now.getMonth() && paid.getFullYear() === now.getFullYear();
}

// ─── Add Employee Modal ──────────────────────────────────────────────────────
function AddEmployeeModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "cashier" as const, salary: "", status: "active" as const,
  });

  const handleSubmit = () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setError("");
    startTransition(async () => {
      const res = await addEmployee({
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        role: form.role, status: form.status,
        salary: form.salary ? parseInt(form.salary) : undefined,
      });
      if (res.success) onClose();
      else setError(res.error || "Failed to add employee.");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add New Employee</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: "Full Name *", key: "name", type: "text", placeholder: "e.g. Ravi Kumar" },
            { label: "Email *", key: "email", type: "email", placeholder: "ravi@esvalo.com" },
            { label: "Phone", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
            { label: "Monthly Salary (₹)", key: "salary", type: "number", placeholder: "25000" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{label}</label>
              <input
                type={type} placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none"
              />
            </div>
          ))}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as any }))}
                className="admin-select w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none capitalize">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="admin-select w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none capitalize">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isPending}
              className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isPending ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────────────────────
function EditEmployeeModal({ employee, onClose, onUndoPaid }: { employee: Employee; onClose: () => void; onUndoPaid: (id: number) => void }) {
  const [isPending, startTransition] = useTransition();
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: employee.name,
    salary: employee.salary?.toString() || "",
    role: employee.role,
    status: employee.status,
    phone: employee.phone || "",
  });

  const isPaidThisMonth = isSalaryPaidThisMonth(employee.salaryPaidAt);

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await updateEmployee(employee.id, {
        name: form.name,
        salary: form.salary ? parseInt(form.salary) : undefined,
        role: form.role,
        status: form.status,
        phone: form.phone || undefined,
      });
      if (res.success) onClose();
      else setError(res.error || "Failed to update.");
    });
  };

  const handleUndoPaid = async () => {
    setIsUndoing(true);
    onUndoPaid(employee.id); // optimistic in parent
    await resetSalaryPaid(employee.id);
    setIsUndoing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Employee</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Monthly Salary (₹)</label>
            <input type="number" value={form.salary} onChange={(e) => setForm(f => ({ ...f, salary: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as any }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none">
                {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          {isPaidThisMonth && employee.salary && (
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Salary marked as paid</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Was this a mistake?</p>
              </div>
              <button
                onClick={handleUndoPaid}
                disabled={isUndoing}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 underline underline-offset-2 transition-colors disabled:opacity-60"
              >
                {isUndoing ? <Clock className="h-3.5 w-3.5 animate-spin" /> : null}
                {isUndoing ? "Undoing..." : "Undo Payment"}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isPending}
              className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Table ──────────────────────────────────────────────────────────────
export function EmployeesTable({
  initialEmployees,
  onAdd,
  showAddModal,
  onCloseAdd,
}: {
  initialEmployees: Employee[];
  onAdd: () => void;
  showAddModal?: boolean;
  onCloseAdd?: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteEmployee(id);
      setDeletingId(null);
    });
  };

  const handleMarkPaid = (id: number) => {
    // Optimistic update: flip UI immediately
    setPayingId(id);
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, salaryPaidAt: new Date() } : e)
    );
    // Fire server action in background
    markSalaryPaid(id).finally(() => setPayingId(null));
  };

  const handleUndoPaid = (id: number) => {
    // Optimistic: clear salaryPaidAt immediately
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, salaryPaidAt: null } : e)
    );
  };

  return (
    <>
      {showAddModal && onCloseAdd && (
        <AddEmployeeModal onClose={onCloseAdd} />
      )}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUndoPaid={handleUndoPaid}
        />
      )}

      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Employee?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">This action cannot be undone. The employee will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={isPending}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60">
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input type="text" placeholder="Search by name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-yellow-500"
            />
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 flex-shrink-0 text-zinc-500" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="admin-select h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-yellow-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-yellow-500 sm:w-auto">
              <option value="all">All Roles</option>
              {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
            </div>
            <button onClick={onAdd}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-yellow-500 px-4 text-sm font-medium text-white transition-colors hover:bg-yellow-600 sm:w-auto">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Salary</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Salary (This Month)</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => {
                    const salarySentThisMonth = isSalaryPaidThisMonth(emp.salaryPaidAt);
                    return (
                      <tr key={emp.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-400 font-bold text-sm flex-shrink-0">
                              {emp.name.charAt(0)}
                            </div>
                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-zinc-900 dark:text-zinc-100">{emp.email}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{emp.phone || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 capitalize font-medium text-zinc-700 dark:text-zinc-300">{emp.role}</td>
                        <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {emp.salary ? `₹${emp.salary.toLocaleString()}` : <span className="text-zinc-400 font-normal">N/A</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            emp.status === "active" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                            emp.status === "inactive" && "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
                            emp.status === "on_leave" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {emp.status.replace("_", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {emp.salary ? (
                            salarySentThisMonth ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" /> Paid
                              </span>
                            ) : (
                              <button onClick={() => handleMarkPaid(emp.id)} disabled={payingId === emp.id}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-70">
                                {payingId === emp.id
                                  ? <Clock className="h-4 w-4 animate-spin" />
                                  : <Clock className="h-4 w-4" />
                                }
                                {payingId === emp.id ? "Paying..." : "Mark as Paid"}
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-zinc-400">No salary set</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingEmployee(emp)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletingId(emp.id)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 md:hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-zinc-500">
                No employees found.
              </div>
            ) : (
              filtered.map((emp) => {
                const salarySentThisMonth = isSalaryPaidThisMonth(emp.salaryPaidAt);
                return (
                  <div key={emp.id} className="space-y-4 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{emp.email}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{emp.phone || "N/A"}</p>
                      </div>
                      <span className={cn(
                        "inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        emp.status === "active" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                        emp.status === "inactive" && "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
                        emp.status === "on_leave" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {emp.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Role</p>
                        <p className="mt-1 capitalize text-zinc-900 dark:text-zinc-100">{emp.role}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Salary</p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-100">
                          {emp.salary ? `₹${emp.salary.toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {emp.salary ? (
                        salarySentThisMonth ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" /> Paid this month
                          </span>
                        ) : (
                          <button onClick={() => handleMarkPaid(emp.id)} disabled={payingId === emp.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 transition-colors hover:text-red-700 disabled:opacity-70 dark:text-red-400 dark:hover:text-red-300">
                            {payingId === emp.id
                              ? <Clock className="h-4 w-4 animate-spin" />
                              : <Clock className="h-4 w-4" />
                            }
                            {payingId === emp.id ? "Paying..." : "Mark as Paid"}
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-zinc-400">No salary set</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingEmployee(emp)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button onClick={() => setDeletingId(emp.id)}
                          className="inline-flex items-center justify-center rounded-md border border-zinc-200 px-3 py-2 text-red-500 transition-colors hover:bg-red-50 dark:border-zinc-800 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
