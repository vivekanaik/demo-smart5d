"use client";

import { useState } from "react";
import useSWR from "swr";
import { BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OverviewChart } from "@/components/admin/OverviewChart";
import { getRevenueChartData, TimeFrame } from "@/actions/dashboard";

const timeFrames: { label: string; value: TimeFrame; desc: string }[] = [
  { label: "Daily", value: "daily", desc: "Daily revenue for the past 7 days." },
  { label: "Weekly", value: "weekly", desc: "Weekly revenue for the past 4 weeks." },
  { label: "Monthly", value: "monthly", desc: "Monthly revenue for the past 12 months." },
  { label: "6 Months", value: "6month", desc: "Monthly revenue for the past 6 months." },
  { label: "Yearly", value: "yearly", desc: "Yearly revenue for the past 5 years." },
];

export function RevenueChartWidget() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");

  // Fetch with polling every 5 seconds for real-time updates
  const { data, error, isLoading } = useSWR(
    ["revenueChart", timeFrame],
    ([_, tf]) => getRevenueChartData(tf),
    { refreshInterval: 5000, keepPreviousData: true }
  );

  const selectedFrame = timeFrames.find((t) => t.value === timeFrame);

  // Fill in empty gaps for 'daily' (7 days) if needed, but since we rely on DB output,
  // we could format missing days. For simplicity, we just pass the grouped DB data directly.
  // The backend already limits by startDate, so the chart handles the available data.
  const chartData = data?.success && data.data ? data.data : [];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-4 h-full flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-yellow-500" />
            Revenue Overview
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {selectedFrame?.desc}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Link href="/admin/orders" className="text-xs font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
            View all orders <ArrowRight size={12} />
          </Link>
          <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            {timeFrames.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeFrame(tf.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeFrame === tf.value
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 mt-2 min-h-[300px]">
        {isLoading && chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-red-500">
            Failed to load data
          </div>
        ) : chartData.length === 0 ? (
           <div className="h-full w-full flex items-center justify-center text-sm text-zinc-500">
             No revenue data for this period
           </div>
        ) : (
          <OverviewChart data={chartData} />
        )}
      </div>
    </div>
  );
}
