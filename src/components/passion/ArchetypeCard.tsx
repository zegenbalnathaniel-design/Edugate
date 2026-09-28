import type { Archetype } from "@/lib/data/types";

/**
 * docs/04-passion-engine.md §5. The caller decides whether to render this or
 * the top-signals fallback — archetype is only ever passed here non-null.
 */
export function ArchetypeCard({
  archetype,
  blend,
}: {
  archetype: Archetype;
  blend?: Archetype | null;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="meta mb-2 text-current/45">Your pattern</p>
        <h3 className="display-m">{archetype.name}</h3>
        {blend && (
          <p className="mt-3 text-[0.9375rem] text-current/70">
            Your signals sit between two patterns — this one, and{" "}
            <strong className="text-current">{blend.name}</strong>.
          </p>
        )}
        <p className="measure mt-4 text-body-l leading-relaxed text-current/80">
          {archetype.description}
        </p>
      </div>

      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <List title="What pulls your attention" items={archetype.pullsAttention} />
        <List title="How you work" items={archetype.howYouWork} />
        <List title="What motivates you" items={archetype.whatMotivates} />
        <List title="What you return to" items={archetype.whatYouReturnTo} />
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="meta mb-2 text-current/45">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-[0.9375rem] text-current/80">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
