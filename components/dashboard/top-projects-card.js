export function TopProjectsCard({ projects }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            Top Performing Projects
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Projects ranked by traffic growth.
          </p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          Live
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {projects.map((project) => (
          <div
            className="grid gap-3 rounded-xl border border-zinc-100 bg-zinc-50 p-4 sm:grid-cols-[1fr_auto]"
            key={project.name}
          >
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                {project.name}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {project.traffic} traffic · {project.keywords} keywords
              </p>
            </div>
            <div className="flex items-center sm:justify-end">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {project.growth}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
