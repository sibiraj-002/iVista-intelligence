import { PageUrlLink } from "@/components/shared/page-url-link";

export function PageMetricsMobileCard({ metrics, url }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <PageUrlLink url={url} />
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {metric.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
