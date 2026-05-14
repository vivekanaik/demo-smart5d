import { getDashboardData } from "@/actions/dashboard";
import { OverviewChart } from "@/components/admin/OverviewChart";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Armchair,
  ChefHat, Users, Package, CalendarDays, ArrowRight,
  AlertTriangle, Clock, CheckCircle2, Flame, UserCheck,
  BarChart2, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function timeAgo(date: Date | string | null) {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  return `${h}h ago`;
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Failed to load dashboard data. Check your database connection.</p>
      </div>
    );
  }

  const { kpis, revenueChart, recentOrders, kitchenTickets, lowStockItems, upcomingReservations } = data;

  // Build a full 7-day array (Mon→today order), filling missing days with 0
  const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = DAY_ABBR[d.getDay()];
    const match = revenueChart.find((r) => r.day?.trim() === label);
    return { day: label, revenue: match?.revenue ?? 0 };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">
            Dashboard Overview
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Here&apos;s what&apos;s happening in your restaurant right now.
          </p>
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* ── ROW 1: Primary KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Revenue (This Month)</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-500/10">
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{fmt(kpis.revenueLastMonth)}</p>
          <p className={cn("mt-1.5 flex items-center gap-1 text-xs font-medium",
            kpis.revenueTrend >= 0 ? "text-emerald-500" : "text-red-500")}>
            {kpis.revenueTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {kpis.revenueTrend >= 0 ? "+" : ""}{kpis.revenueTrend}% vs last month
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Orders Today</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{kpis.ordersToday}</p>
          <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {kpis.ordersLastMonth} orders this month
          </p>
        </div>

        {/* Tables */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tables Active</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <Armchair className="h-4 w-4 text-purple-500" />
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {kpis.occupiedTables} <span className="text-lg font-normal text-zinc-400">/ {kpis.totalTables}</span>
          </p>
          <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {kpis.reservedTables} reserved · {kpis.totalTables - kpis.occupiedTables - kpis.reservedTables} free
          </p>
        </div>

        {/* Kitchen */}
        <div className={cn("rounded-xl border p-5 shadow-sm",
          kpis.pendingKitchenItems > 10
            ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10"
            : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950")}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Kitchen Queue</span>
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg",
              kpis.pendingKitchenItems > 10 ? "bg-red-500/10" : "bg-orange-500/10")}>
              <ChefHat className={cn("h-4 w-4", kpis.pendingKitchenItems > 10 ? "text-red-500" : "text-orange-500")} />
            </span>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {kpis.pendingKitchenItems}
            <span className="text-lg font-normal text-zinc-400 ml-1">pending</span>
          </p>
          <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {kpis.activeKitchenOrders} active order{kpis.activeKitchenOrders !== 1 ? "s" : ""} open
          </p>
        </div>
      </div>

      {/* ── ROW 2: Secondary KPI Strip ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Active Staff</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{kpis.activeEmployees} / {kpis.totalEmployees}</p>
          </div>
          <Link href="/admin/employees" className="ml-auto text-zinc-400 hover:text-yellow-500 transition-colors">
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
            <Users className="h-5 w-5 text-cyan-500" />
          </span>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Customers</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{kpis.totalCustomers}</p>
          </div>
          <Link href="/admin/customers" className="ml-auto text-zinc-400 hover:text-yellow-500 transition-colors">
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
            <Star className="h-5 w-5 text-yellow-500" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Top Dish (30d)</p>
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 inline-block animate-marquee">
                {kpis.popularDish}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{kpis.popularDish}
              </p>
            </div>
          </div>
          <div className="ml-3 flex-shrink-0 text-xs font-semibold text-zinc-400">{kpis.popularDishCount}×</div>
        </div>
      </div>

      {/* ── ROW 3: Revenue Chart + Recent Orders ── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-yellow-500" />
                Revenue Overview
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Daily revenue for the past 7 days.</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              View all orders <ArrowRight size={12} />
            </Link>
          </div>
          <OverviewChart data={chartData} />
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Recent Completions
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Last 5 completed orders.</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-zinc-400 py-4 text-center">No completed orders yet.</p>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {order.tableNumber === "Pickup" ? "Del" : order.tableNumber === "NA" ? "TNA" : `T${order.tableNumber}`}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{order.guestName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{timeAgo(order.closedAt)}</p>
                </div>
                <div className="text-sm font-bold text-emerald-500">+{fmt(order.total)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Kitchen Tickets + Upcoming Reservations ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Kitchen Tickets */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Kitchen — Live Orders
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Currently active tickets awaiting preparation.</p>
            </div>
            <Link href="/admin/kitchen" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              Open Kitchen <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {kitchenTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Kitchen is all clear!</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">No pending orders right now.</p>
              </div>
            ) : kitchenTickets.map((ticket) => {
              const pendingItems = ticket.items.filter(i => i.status === "pending");
              const waitMins = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / 1000 / 60);
              return (
                <div key={ticket.id} className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-3 border",
                  waitMins > 20
                    ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10"
                    : waitMins > 10
                    ? "border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-900/10"
                    : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
                )}>
                  <div className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold border",
                    waitMins > 20 ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                      : "bg-white border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                  )}>
                    {ticket.tableNumber === "Pickup" ? "Del" : ticket.tableNumber === "NA" ? "TNA" : `T${ticket.tableNumber}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ticket.guestName}</p>
                      <span className={cn("text-xs font-medium flex items-center gap-1",
                        waitMins > 20 ? "text-red-500" : waitMins > 10 ? "text-orange-500" : "text-zinc-400")}>
                        <Clock size={10} /> {waitMins}m
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {pendingItems.length} item{pendingItems.length !== 1 ? "s" : ""} pending: {pendingItems.slice(0, 2).map(i => i.name).join(", ")}{pendingItems.length > 2 ? ` +${pendingItems.length - 2}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-purple-500" />
                Upcoming Reservations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Next bookings scheduled for today.</p>
            </div>
            <Link href="/admin/tables" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              All bookings <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CalendarDays className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No reservations today.</p>
              </div>
            ) : upcomingReservations.map((res) => (
              <div key={res.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-xs font-bold text-purple-700 dark:text-purple-400">
                  {res.tableNumber ?? "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{res.customerName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {res.guestsCount} guests · {formatDate(res.reservationTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatTime(res.reservationTime)}</p>
                  <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                    res.status === "confirmed" ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40"
                      : "text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/40")}>
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 5: Inventory Alerts + Quick Actions ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Inventory Alerts
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Items at or below minimum stock level.</p>
            </div>
            <Link href="/admin/inventory" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              Full inventory <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">All stocked up!</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-600">No low stock alerts right now.</p>
              </div>
            ) : lowStockItems.map((item) => {
              const pct = Math.min(100, Math.round((item.quantity / item.minStockAlert) * 100));
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2.5">
                  <Package className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.itemName}</p>
                      <span className="text-xs font-bold text-red-500 ml-2 flex-shrink-0">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", pct <= 25 ? "bg-red-500" : pct <= 50 ? "bg-orange-500" : "bg-yellow-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Quick Actions</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Navigate to key areas of your dashboard.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Orders", href: "/admin/orders", icon: ShoppingBag, color: "blue" },
              { label: "Kitchen Display", href: "/admin/kitchen", icon: ChefHat, color: "orange" },
              { label: "Tables & Bookings", href: "/admin/tables", icon: Armchair, color: "purple" },
              { label: "POS Billing", href: "/admin/pos", icon: DollarSign, color: "yellow" },
              { label: "Inventory", href: "/admin/inventory", icon: Package, color: "red" },
              { label: "Employees", href: "/admin/employees", icon: Users, color: "emerald" },
              { label: "Customers", href: "/admin/customers", icon: UserCheck, color: "cyan" },
              { label: "Leaves & Holidays", href: "/admin/leaves", icon: CalendarDays, color: "pink" },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm font-medium text-zinc-700 transition-all hover:border-yellow-400 hover:bg-yellow-50 hover:text-yellow-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-yellow-500/50 dark:hover:bg-yellow-500/10 dark:hover:text-yellow-400"
              >
                <Icon className="h-4 w-4 flex-shrink-0 text-zinc-400 group-hover:text-yellow-500 transition-colors" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
