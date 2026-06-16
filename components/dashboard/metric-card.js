import { ArrowUpRight } from "lucide-react";

export function MetricCard({ label, value, change, description }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
            {value}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {change}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}
