export function InsightPanel({ title, items }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
          Live
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            key={item.title}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {item.description}
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-500 shadow-sm">
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
