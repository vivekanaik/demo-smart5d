import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ title, value, icon, trend, className }: KPICardProps) {
  return (
    <div className={cn("rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <div className="flex-shrink-0 rounded-lg bg-yellow-50 p-2 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</h3>
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.isPositive ? "+" : "-"}{trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
