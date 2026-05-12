"use client";

import { useState, useTransition } from "react";
import {
  Calendar, UserMinus, Plus, X, Clock, Check, XCircle, Trash2,
  ChevronDown, CalendarDays, AlarmClock
} from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  addLeaveRequest, updateLeaveStatus, deleteLeaveRequest,
  addHoliday, deleteHoliday
} from "@/actions/leaves";

type Employee = { id: number; name: string; role: string };
type LeaveRequest = {
  id: number;
  userId: number;
  leaveType: "sick" | "casual" | "earned" | "unpaid";
  startDate: string;
  endDate: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  user: { name: string; role: string } | null;
};
type Holiday = {
  id: number;
  name: string;
  date: string;
  type: "national" | "festival" | "optional";
};

const LEAVE_TYPES = [
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "earned", label: "Earned Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
] as const;

const HOLIDAY_TYPES = [
  { value: "national", label: "National" },
  { value: "festival", label: "Festival" },
  { value: "optional", label: "Optional" },
] as const;

// ─── New Leave Request Modal ─────────────────────────────────────────────────
function NewLeaveModal({ employees, onClose }: { employees: Employee[]; onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    userId: "",
    leaveType: "casual" as const,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const days = form.startDate && form.endDate
    ? differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1
    : 0;

  const handleSubmit = () => {
    if (!form.userId || !form.startDate || !form.endDate) {
      setError("Please fill all required fields."); return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date."); return;
    }
    setError("");
    startTransition(async () => {
      const res = await addLeaveRequest({
        userId: parseInt(form.userId),
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
      });
      if (res.success) onClose();
      else setError(res.error || "Failed to submit.");
    });
  };

  const inputCls = "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">New Leave Request</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Employee *</label>
            <select value={form.userId} onChange={(e) => setForm(f => ({ ...f, userId: e.target.value }))}
              className={`admin-select ${inputCls}`}>
              <option value="">Select employee</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Leave Type *</label>
            <select value={form.leaveType} onChange={(e) => setForm(f => ({ ...f, leaveType: e.target.value as any }))}
              className={`admin-select ${inputCls}`}>
              {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={inputCls} />
            </div>
          </div>

          {days > 0 && (
            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg px-3 py-2">
              <AlarmClock className="h-4 w-4 flex-shrink-0" />
              <span>{days} day{days > 1 ? "s" : ""} of leave</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reason</label>
            <textarea rows={3} placeholder="Optional reason for leave..."
              value={form.reason} onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
              className={`${inputCls} resize-none`} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isPending}
              className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <Clock className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isPending ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Holiday Modal ────────────────────────────────────────────────────────
function AddHolidayModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", date: "", type: "national" as const });

  const handleSubmit = () => {
    if (!form.name || !form.date) { setError("Name and date are required."); return; }
    setError("");
    startTransition(async () => {
      const res = await addHoliday(form);
      if (res.success) onClose();
      else setError(res.error || "Failed to add.");
    });
  };

  const inputCls = "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-yellow-500 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add Holiday</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Holiday Name *</label>
            <input type="text" placeholder="e.g. Diwali" value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date *</label>
            <input type="date" value={form.date}
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}
              className={`admin-select ${inputCls}`}>
              {HOLIDAY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isPending}
              className="flex-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isPending ? <Clock className="h-4 w-4 animate-spin" /> : null}
              {isPending ? "Adding..." : "Add Holiday"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function LeavesPageClient({
  employees,
  initialLeaves,
  initialHolidays,
}: {
  employees: Employee[];
  initialLeaves: LeaveRequest[];
  initialHolidays: Holiday[];
}) {
  const [showNewLeave, setShowNewLeave] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [holidayList, setHolidayList] = useState<Holiday[]>(initialHolidays);
  const [isPending, startTransition] = useTransition();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingHolidays = holidayList
    .filter(h => new Date(h.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const onLeave = employees.filter(e =>
    leaves.some(l =>
      l.userId === e.id &&
      l.status === "approved" &&
      new Date(l.startDate) <= today &&
      new Date(l.endDate) >= today
    )
  );

  const handleStatusChange = (id: number, status: "approved" | "rejected") => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    startTransition(async () => { await updateLeaveStatus(id, status); });
  };

  const handleDeleteLeave = (id: number) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    startTransition(async () => { await deleteLeaveRequest(id); });
  };

  const handleDeleteHoliday = (id: number) => {
    setHolidayList(prev => prev.filter(h => h.id !== id));
    startTransition(async () => { await deleteHoliday(id); });
  };

  return (
    <>
      {showNewLeave && <NewLeaveModal employees={employees} onClose={() => setShowNewLeave(false)} />}
      {showAddHoliday && <AddHolidayModal onClose={() => setShowAddHoliday(false)} />}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Leaves & Holidays</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage staff time off and public holidays.</p>
          </div>
          <button onClick={() => setShowNewLeave(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" /> New Leave Request
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Requests", value: leaves.length, color: "text-zinc-900 dark:text-zinc-100" },
            { label: "Pending", value: leaves.filter(l => l.status === "pending").length, color: "text-amber-600 dark:text-amber-400" },
            { label: "On Leave Today", value: onLeave.length, color: "text-red-600 dark:text-red-400" },
            { label: "Upcoming Holidays", value: upcomingHolidays.length, color: "text-yellow-600 dark:text-yellow-400" },
          ].map(card => (
            <div key={card.label} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{card.label}</p>
              <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: on leave + holidays */}
          <div className="space-y-6">
            {/* Currently On Leave */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                <UserMinus className="h-5 w-5 text-amber-500" /> On Leave Today
              </h3>
              {onLeave.length === 0 ? (
                <p className="text-sm text-zinc-500">No staff on leave today.</p>
              ) : (
                <div className="space-y-3">
                  {onLeave.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-sm flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</p>
                        <p className="text-xs text-zinc-500 capitalize">{emp.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Holidays */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yellow-500" /> Upcoming Holidays
                </h3>
                <button onClick={() => setShowAddHoliday(true)}
                  className="flex items-center gap-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>

              {upcomingHolidays.length === 0 ? (
                <p className="text-sm text-zinc-500">No upcoming holidays.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingHolidays.map(h => {
                    const d = new Date(h.date);
                    const daysUntil = differenceInDays(d, today);
                    return (
                      <div key={h.id} className="flex items-center gap-3 group">
                        <div className="flex flex-col items-center justify-center h-11 w-11 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0 text-center">
                          <span className="text-[10px] font-bold text-red-500 uppercase leading-none">{format(d, 'MMM')}</span>
                          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{format(d, 'd')}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{h.name}</p>
                          <p className="text-xs text-zinc-500">
                            {HOLIDAY_TYPES.find(t => t.value === h.type)?.label} •{" "}
                            {daysUntil === 0 ? "Today" : `${daysUntil}d away`}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteHoliday(h.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-500 text-zinc-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Leave requests table */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">Leave Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {leaves.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500">No leave requests yet.</td></tr>
                  ) : (
                    leaves.map(leave => {
                      const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
                      return (
                        <tr key={leave.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{leave.user?.name ?? "—"}</p>
                            <p className="text-xs text-zinc-500 capitalize">{leave.user?.role}</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 capitalize text-xs font-medium">
                            {LEAVE_TYPES.find(t => t.value === leave.leaveType)?.label}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-zinc-900 dark:text-zinc-100">
                              {format(new Date(leave.startDate), "MMM d")} – {format(new Date(leave.endDate), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-zinc-500">{days} day{days > 1 ? "s" : ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              leave.status === "pending" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                              leave.status === "approved" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                              leave.status === "rejected" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            )}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {leave.status === "pending" && (
                                <>
                                  <button onClick={() => handleStatusChange(leave.id, "approved")} disabled={isPending}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors"
                                    title="Approve">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleStatusChange(leave.id, "rejected")} disabled={isPending}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                    title="Reject">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleDeleteLeave(leave.id)} disabled={isPending}
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                title="Delete">
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
          </div>
        </div>
      </div>
    </>
  );
}
