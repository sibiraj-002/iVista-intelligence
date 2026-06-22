import { ArrowUpRight } from "lucide-react";

export function KpiCard({ icon: Icon, label, value, change }) {
  return (
    <article
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      data-reveal
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <ArrowUpRight className="h-3.5 w-3.5" />
          Growth
        </span>
      </div>
      <div className="mt-5">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {value}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{change}</p>
      </div>
    </article>
  );
}
