import { Container, Section } from "@/components/primitives/Section";

/** Shown instantly while a college profile streams in, so a click never feels dead. */
export default function Loading() {
  const bar = "animate-pulse rounded-[var(--radius-md)] bg-paper/10";
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container>
        <div aria-busy="true" aria-label="Loading college" className="space-y-6">
          <div className={`${bar} h-3 w-64`} />
          <div className="flex items-center gap-4">
            <div className={`${bar} size-16 rounded-2xl`} />
            <div className="flex-1 space-y-3">
              <div className={`${bar} h-8 w-3/4 max-w-xl`} />
              <div className={`${bar} h-4 w-1/2 max-w-md`} />
            </div>
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className={`${bar} h-9 w-24 shrink-0 rounded-full`} />
            ))}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`${bar} h-24`} />
            ))}
          </div>
          <div className={`${bar} h-48`} />
        </div>
      </Container>
    </Section>
  );
}
