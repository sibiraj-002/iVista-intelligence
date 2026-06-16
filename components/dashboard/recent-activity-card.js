import { Clock3 } from "lucide-react";

export function RecentActivityCard({ activities }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Latest updates across projects and reports.
          </p>
        </div>
        <Clock3 className="h-5 w-5 text-zinc-400" />
      </div>

      <div className="mt-5 space-y-4">
        {activities.map((activity) => (
          <div className="flex gap-3" key={activity.title}>
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-zinc-950 ring-4 ring-zinc-100" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-zinc-950">
                  {activity.title}
                </p>
                <span className="text-xs font-medium text-zinc-400">
                  {activity.time}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
