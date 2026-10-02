import Link from "next/link";
import { Container } from "@/components/primitives/Section";

const GROUPS = [
  {
    title: "Platform",
    links: [
      { label: "Universities", href: "/universities" },
      { label: "By country", href: "/universities/countries" },
      { label: "Compare", href: "/compare" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Passion Projector", href: "/passion-projector" },
    ],
  },
  {
    title: "Who it's for",
    links: [
      { label: "Students", href: "/discover" },
      { label: "Parents", href: "/parents" },
      { label: "Application tracker", href: "/tracker" },
    ],
  },
  {
    title: "Trust",
    links: [{ label: "Methodology", href: "/methodology" }],
  },
];

export function SiteFooter() {
  return (
    <footer data-register="dark" className="border-t border-paper/10">
      <Container width="wide" className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2.6fr]">
          <div>
            <p className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-paper">
              EDUGATE
            </p>
            <p className="mt-4 font-display text-[1.5rem] leading-[1.15] font-medium tracking-[-0.02em] text-paper/45">
              Discover.
              <br />
              Discern.
              <br />
              Decide.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="meta text-paper/40">{group.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="link-underline text-[0.875rem] text-paper/65 transition-colors hover:text-paper"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper/10 pt-8 md:flex-row md:items-center md:justify-between">
          {/*
            One of only two places sitewide where "free" appears (D3).
            Repetition would undercut it — it reads as philosophy, not a offer.
          */}
          <p className="text-[0.875rem] text-paper/55">
            Edugate is free for students, parents and institutions.
          </p>
        </div>
      </Container>
    </footer>
  );
}
