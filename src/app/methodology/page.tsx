import type { Metadata } from "next";
import { Section, Container, SectionLabel } from "@/components/primitives/Section";
import { MAX_CUTOFF_AGE } from "@/lib/unis/match";

export const metadata: Metadata = { title: "Methodology" };

const TIERS = [
  {
    name: "Signature",
    body: "Bespoke, iterated pages — the ones the product is built around, like Passion Projector.",
  },
  {
    name: "Product",
    body: "Full interactions: filtering, sorting, state that persists. Discover and Compare are here.",
  },
  {
    name: "Structural",
    body: "Real data and real navigation, read-mostly. Fewer actions, but every action shown works — nothing says \"coming soon.\"",
  },
];

const NEVER_ALWAYS: [string, string][] = [
  ["“You should study X”", "“One pathway worth exploring”"],
  ["“Your perfect career”", "“Where this could lead”"],
  ["“You are 87% entrepreneur”", "“Strong signal: Creation”"],
  ["“Best match” with no reasons", "Match % with every reason listed, labelled “not an admission chance”"],
  ["“Safety school” from reputation", "Reach / Target / Safety only from a published cut-off or acceptance rate"],
];

/**
 * Tier C (docs/00-decisions.md → D1): static content, no data fetch, but a
 * real page — not a placeholder. This is the honesty model itself (D2, D3,
 * D6), written for a visitor instead of a contributor.
 */
export default function MethodologyPage() {
  return (
    <div data-register="light" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">Methodology</SectionLabel>
        <h1 className="display-m mt-3 mb-6">How Edugate decides what to show you</h1>
        <p className="measure mb-14 text-[0.9375rem] text-current/65">
          Everything below is a real commitment we hold ourselves to, not a
          marketing page. If you find a place where the product breaks one
          of these, that's a bug — tell us.
        </p>

        <section className="mb-14">
          <h2 className="meta mb-4 text-current/50">No dead pages</h2>
          <p className="measure mb-6 text-[0.9375rem] text-current/70">
            Every route ships with real data and real interactions. What
            varies between pages is how much a page can do, never whether
            what it does show actually works.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className="glass p-5">
                <p className="text-[0.9375rem] font-medium text-current">{t.name}</p>
                <p className="mt-2 text-[0.8125rem] text-current/60">{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <h2 className="meta mb-4 text-current/50">Where the data comes from</h2>
          <p className="measure mb-4 text-[0.9375rem] text-current/70">
            Institution, course, career and scholarship records on this
            platform are marked with a provenance label wherever they
            appear:
          </p>
          <ul className="measure space-y-3 text-[0.9375rem] text-current/70">
            <li>
              <strong className="text-current">Illustrative</strong> — a demo
              record used to show how the product works. Never presented as a
              real institution.
            </li>
            <li>
              <strong className="text-current">Institution-supplied</strong> —
              submitted directly by the institution, not independently
              checked yet.
            </li>
            <li>
              <strong className="text-current">Verified</strong> — checked
              against a dated source, with that source attached to the
              record.
            </li>
          </ul>
          <p className="measure mt-4 text-[0.9375rem] text-current/70">
            Where no verification exists, the field is simply left out —
            never filled with a fabricated or estimated number. Figures that imply measurement (cost,
            outcomes) are shown as ranges, never as a single suspiciously
            precise statistic, unless they're arithmetic over numbers you
            entered yourself.
          </p>
        </section>

        <section className="mb-14">
          <h2 className="meta mb-4 text-current/50">How we phrase recommendations</h2>
          <p className="measure mb-6 text-[0.9375rem] text-current/70">
            Passion Projector and the recommendation surfaces on this site
            never claim certainty they don't have. Every recommendation
            shows the specific responses or signals that produced it.
          </p>
          <div className="glass overflow-hidden">
            <table className="w-full text-left text-[0.875rem]">
              <thead>
                <tr className="border-b border-current/10">
                  <th className="px-5 py-3 font-medium text-current/50">Never</th>
                  <th className="px-5 py-3 font-medium text-current/50">Always</th>
                </tr>
              </thead>
              <tbody>
                {NEVER_ALWAYS.map(([never, always]) => (
                  <tr key={never} className="border-b border-current/8 last:border-0">
                    <td className="px-5 py-3 text-current/60 line-through decoration-current/30">{never}</td>
                    <td className="px-5 py-3 text-current/85">{always}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="meta mb-4 text-current/50">How college matching works</h2>
          <div className="measure space-y-4 text-[0.9375rem] text-current/70">
            <p>
              <strong className="text-current">Match %</strong> is a weighted share of the checks we can make for a course — does it cover the
              subjects you chose, do your board and Class XI–XII subjects meet its published requirements, do you have the tests it needs,
              is its tuition within your budget, is it where you want to study, does it document internships, research or entrepreneurship.
              Your own priority weights decide how much each check counts. Checks we can&apos;t make (because data isn&apos;t published) are
              left out and reported as &ldquo;unknown&rdquo;, never counted for or against.
            </p>
            <p>
              <strong className="text-current">Reach / Target / Safety</strong> uses only published evidence, in this order: your JEE Advanced
              rank against the last published JoSAA closing rank for that course (≤ 70% of the closing rank is Safety, up to the closing rank
              Target, beyond it Reach); your Class XII percentage against a published merit-list cut-off (3+ points above is Safety, within a
              point Target, below Reach); otherwise the institution&apos;s published acceptance rate. If you&apos;re missing a published
              requirement, the course shows &ldquo;Not yet eligible&rdquo;. Ranks and cut-offs more than {MAX_CUTOFF_AGE} years old are
              ignored and named as too old to compare against. With none of that evidence, it&apos;s &ldquo;Unclassified&rdquo; — we
              don&apos;t guess from reputation.
            </p>
            <p>
              <strong className="text-current">University Wrapped</strong> scores every institution on course fit (20%), career fit (15%),
              academic fit (15%), financial fit (15%), campus fit (10%), admission odds (10%), location (5%), flexibility (5%) and career
              ROI (5%) — leaving out any dimension we have no data for. Hard limits come first: places you won&apos;t go, single-gender
              colleges unless you opt in, subjects a course requires that you don&apos;t take, and costs beyond what your budget and loan
              comfort can stretch to. Dream / Reach / Target / Safety use the same published evidence as above; colleges that publish no
              cut-offs are shown as &ldquo;odds unpublished&rdquo;.
            </p>
            <p>
              <strong className="text-current">Selectivity</strong> bands come from published acceptance rates: under 15% highly selective,
              15–35% selective, 35–65% moderate, above 65% accessible. A JoSAA/JEE Advanced closing rank of 5,000 or better (open category)
              for an institution&apos;s most competitive listed course also counts as highly selective.
            </p>
            <p>
              <strong className="text-current">Fees in rupees</strong> are tuition per year as published. For institutions abroad we convert
              at dated reference rates and mark the figure &ldquo;≈&rdquo;. A whole-degree total is yearly tuition × duration and is labelled
              as calculated; a year&apos;s cost adds only items the institution publishes per year or semester.
            </p>
            <p>
              <strong className="text-current">Courses are grouped by subject</strong> from their official names: &ldquo;B.Com (Accounting
              &amp; Finance)&rdquo; appears under Commerce and Finance, &ldquo;PPE&rdquo; under Economics, Political Science and Philosophy.
              The official name is always what&apos;s shown.
            </p>
          </div>
        </section>

        <section>
          <h2 className="meta mb-4 text-current/50">Free, structurally</h2>
          <p className="measure text-[0.9375rem] text-current/70">
            There is no pricing page, plan, subscription, or paid placement
            anywhere in this product — not as a feature we chose to omit,
            but as a constraint enforced in the data model itself. No listing
            can be ranked or promoted because payment isn't a field that
            exists to rank or promote by.
          </p>
        </section>
      </Container>
    </div>
  );
}
