import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, NotYet } from "@/components/unis/Blocks";
import { Sourced } from "@/components/unis/Sourced";
import { getUniversity } from "@/lib/unis/repo";

type Props = { params: Promise<{ slug: string }> };

const FACILITY_GROUPS: [string, string][] = [
  ["library", "Libraries"], ["lab", "Labs & research facilities"], ["it", "IT & computing"], ["sports", "Sports"], ["hostel", "Hostels"],
  ["dining", "Dining"], ["health", "Health & wellbeing"], ["transport", "Transport"], ["auditorium", "Auditoriums & venues"], ["other", "Other facilities"],
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const row = await getUniversity((await params).slug);
  return { title: row ? `${row.name} campus, facilities & hostels` : "Campus" };
}

export default async function CampusPage({ params }: Props) {
  const { slug } = await params;
  const row = await getUniversity(slug);
  if (!row) notFound();
  const u = row.data;
  const S = u.sources;
  const d = u.details;

  return (
    <div className="space-y-14">
      <Block title="Campus">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass p-4">
            <dt className="meta text-paper/50">Location</dt>
            <dd className="mt-1">{u.locality ? `${u.locality}, ` : ""}{u.city}, {u.region}, {u.country}</dd>
            {u.hub && u.hub !== u.city && <dd className="mt-1 text-[0.8125rem] text-paper/60">Listed under {u.hub} on Edugate</dd>}
            {d.address && <dd className="mt-1 text-[0.8125rem] text-paper/60">{d.address}</dd>}
          </div>
          <div className="glass p-4">
            <dt className="meta text-paper/50">Campus area</dt>
            <dd className="mt-1">
              <Sourced sourceId={d.campusAreaAcres.sourceId} sources={S} confidence={d.campusAreaAcres.confidence} asOf={d.campusAreaAcres.asOf} notes={d.campusAreaAcres.notes}>
                {d.campusAreaAcres.value != null ? `${d.campusAreaAcres.value.toLocaleString("en-US")} acres` : null}
              </Sourced>
            </dd>
          </div>
          <div className="glass p-4">
            <dt className="meta text-paper/50">Setting</dt>
            <dd className="mt-1 capitalize">{u.setting ?? <span className="text-paper/50 normal-case">Not verified</span>}</dd>
          </div>
          <div className="glass p-4">
            <dt className="meta text-paper/50">Campuses</dt>
            <dd className="mt-1">{u.campuses.length ? u.campuses.join(", ") : u.city}</dd>
          </div>
        </dl>
      </Block>

      <Block title="Hostels & housing">
        {d.housing.value ? (
          <p className="measure text-[0.9375rem] text-paper/85">
            <Sourced sourceId={d.housing.sourceId} sources={S} confidence={d.housing.confidence} asOf={d.housing.asOf} notes={d.housing.notes}>
              {d.housing.value}
            </Sourced>
          </p>
        ) : (
          <NotYet>Accommodation details not verified yet — see the university&apos;s housing pages.</NotYet>
        )}
      </Block>

      <Block title="Facilities" note="Libraries, labs, sports, dining, health and transport, as the institution describes them.">
        {d.facilities.length === 0 ? (
          <NotYet>No facilities documented on Edugate yet.</NotYet>
        ) : (
          <div className="space-y-8">
            {FACILITY_GROUPS.map(([cat, label]) => {
              const list = d.facilities.filter((f) => (f.category ?? "other") === cat);
              if (!list.length) return null;
              return (
                <div key={cat}>
                  <h3 className="meta mb-3 text-paper/50">{label}</h3>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {list.map((f) => (
                      <li key={f.name} className="glass p-4">
                        <p className="font-medium">
                          <Sourced sourceId={f.sourceId} sources={S}>{f.name}</Sourced>
                        </p>
                        {f.description && <p className="mt-1 text-[0.875rem] text-paper/70">{f.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Block>

      <Block title="Contact">
        <dl className="grid gap-4 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4">
          <div className="glass p-4"><dt className="meta text-paper/50">Website</dt><dd className="mt-1 break-words"><a href={u.website} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">{u.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></dd></div>
          {u.admissionsUrl && <div className="glass p-4"><dt className="meta text-paper/50">Admissions</dt><dd className="mt-1"><a href={u.admissionsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:underline">Admissions site ↗</a></dd></div>}
          {u.contact?.phone && <div className="glass p-4"><dt className="meta text-paper/50">Phone</dt><dd className="mt-1"><Sourced sourceId={u.contact.sourceId} sources={S}>{u.contact.phone}</Sourced></dd></div>}
          {u.contact?.email && <div className="glass p-4"><dt className="meta text-paper/50">Email</dt><dd className="mt-1 break-words"><Sourced sourceId={u.contact.sourceId} sources={S}>{u.contact.email}</Sourced></dd></div>}
        </dl>
      </Block>

      <Block title="Schools & departments">
        {d.schools.length === 0 ? (
          <NotYet>Academic units not listed yet.</NotYet>
        ) : (
          <>
            <ul className="columns-1 gap-8 text-[0.9375rem] sm:columns-2 lg:columns-3">
              {d.schools.map((s) => (
                <li key={s} className="mb-1.5 break-inside-avoid">{s}</li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8125rem]">
              <Sourced sourceId={d.schoolsSourceId} sources={S}>Source for this list</Sourced>
            </p>
          </>
        )}
      </Block>

      <Block title="Faculty">
        <p className="text-[0.9375rem]">
          <Sourced sourceId={d.faculty.sourceId} sources={S} confidence={d.faculty.confidence} asOf={d.faculty.asOf} notes={d.faculty.notes}>
            {d.faculty.value != null ? `${d.faculty.value.toLocaleString("en-US")} faculty members` : null}
          </Sourced>
          {u.stats.studentFacultyRatio.value && <span className="text-paper/60"> · student : faculty {u.stats.studentFacultyRatio.value}</span>}
        </p>
      </Block>
    </div>
  );
}
