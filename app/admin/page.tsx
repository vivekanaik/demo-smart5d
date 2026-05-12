import { KPICard } from "@/components/admin/KPICard";
import { OverviewChart } from "@/components/admin/OverviewChart";
import { DollarSign, Users, ShoppingBag, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-3xl">Dashboard Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Here&apos;s what&apos;s happening in your restaurant today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value="₹45,231"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: "20.1% from last month", isPositive: true }}
        />
        <KPICard
          title="Orders Today"
          value="+2350"
          icon={<ShoppingBag className="h-5 w-5" />}
          trend={{ value: "180.1% from last month", isPositive: true }}
        />
        <KPICard
          title="Active Tables"
          value="12 / 24"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: "4 reserved", isPositive: true }}
        />
        <KPICard
          title="Kitchen Status"
          value="14 Pending"
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: "Average wait 12m", isPositive: false }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:col-span-4">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Revenue Overview</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Daily revenue for the past 7 days.</p>
          </div>
          <OverviewChart />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 lg:col-span-3">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Recent Sales</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">You made 265 sales today.</p>
          </div>
          
          {/* Placeholder for Recent Sales List */}
          <div className="space-y-6 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Users className="h-5 w-5 text-zinc-500" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none dark:text-zinc-200">Table {i * 2}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Guest Name</p>
                </div>
                <div className="font-medium dark:text-yellow-400">+₹{1200 + i * 150}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
