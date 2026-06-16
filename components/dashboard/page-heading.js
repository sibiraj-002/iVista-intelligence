export function PageHeading({ title, description }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          {description}
        </p>
      </div>
      <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 shadow-sm">
        Updated 3 minutes ago
      </div>
    </div>
  );
}
