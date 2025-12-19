import { PlanResponse } from "@/lib/types";

interface Props {
  plan: PlanResponse;
}

export default function PlanView({ plan }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Summary</h2>
          <span className="rounded bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
            Confidence: {(plan.summary.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <h3 className="mt-2 text-lg">{plan.summary.title}</h3>
        <div className="mt-3 space-y-2 text-slate-700">
          <div>
            <p className="font-medium">Key advice</p>
            <ul className="list-disc space-y-1 pl-5">
              {plan.summary.key_advice.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          {plan.summary.assumptions.length > 0 && (
            <div>
              <p className="font-medium">Assumptions</p>
              <ul className="list-disc space-y-1 pl-5">
                {plan.summary.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl">Timeline</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {plan.timeline.map((item) => (
            <div key={item.when} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.when}</p>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium">
                  {item.priority}
                </span>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                {item.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl">Checklist</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plan.checklist.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{item.title}</p>
                <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                  {item.priority}
                </span>
              </div>
              <p className="text-xs text-slate-500">Est. time: {item.estimated_time}</p>
              {item.dependencies.length > 0 && (
                <p className="text-xs text-slate-500">Depends on: {item.dependencies.join(", ")}</p>
              )}
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl">Documents</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plan.documents.map((group) => (
            <div key={group.category} className="rounded-lg border p-4">
              <p className="text-lg font-semibold">{group.category}</p>
              <ul className="mt-2 space-y-3">
                {group.items.map((doc) => (
                  <li key={doc.name} className="rounded bg-slate-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{doc.name}</p>
                      <span className="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                        {doc.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{doc.why}</p>
                    {doc.common_mistakes.length > 0 && (
                      <p className="text-xs text-rose-600">
                        Common mistakes: {doc.common_mistakes.join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl">Risks & mitigations</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plan.risks.map((risk) => (
            <div key={risk.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{risk.risk}</p>
                <span className="rounded bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                  {risk.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{risk.why_it_matters}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                {risk.mitigation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-2xl">Sources</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {plan.sources.map((source) => (
            <li key={`${source.title}-${source.ref}`}>
              <span className="font-medium">{source.title}</span> — <span>{source.ref}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500">Generated at: {plan.generated_at}</p>
      </section>
    </div>
  );
}
