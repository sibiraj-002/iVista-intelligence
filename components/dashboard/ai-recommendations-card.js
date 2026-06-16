import { Sparkles } from "lucide-react";

export function AiRecommendationsCard({ recommendations }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-950">
            AI Recommendations
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Suggested actions based on recent signals.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {recommendations.map((recommendation) => (
          <div
            className="rounded-xl border border-zinc-100 bg-zinc-50 p-4"
            key={recommendation.title}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  {recommendation.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  {recommendation.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                {recommendation.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
