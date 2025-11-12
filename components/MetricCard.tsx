"use client";

import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  trend?: string;
  className?: string;
  icon?: ReactNode;
}

export const MetricCard = ({ label, value, trend, className, icon }: MetricCardProps) => (
  <div
    className={twMerge(
      "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/30 backdrop-blur",
      className
    )}
  >
    <div className="flex items-center justify-between text-sm font-medium text-slate-400">
      <span>{label}</span>
      {icon ? <span className="text-slate-300">{icon}</span> : null}
    </div>
    <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    {trend ? <p className="mt-2 text-xs text-slate-400">{trend}</p> : null}
  </div>
);
