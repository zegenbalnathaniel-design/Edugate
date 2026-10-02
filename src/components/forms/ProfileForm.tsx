"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileState } from "@/lib/user/actions";
import { CURRICULA, CURRICULUM_LABELS, WEIGHT_KEYS, WEIGHT_LABELS, type StudentProfile } from "@/lib/profile/schema";
import { COUNTRIES } from "@/lib/profile/countries";
import { FIELD_NAMES } from "@/lib/unis/filters";
import { inputCls, labelCls, primaryBtnCls } from "./styles";

const Fieldset = ({ legend, hint, children }: { legend: string; hint?: string; children: React.ReactNode }) => (
  <fieldset className="glass space-y-4 p-5 sm:p-6">
    <legend className="sr-only">{legend}</legend>
    <div>
      <h2 className="font-display text-[1.25rem]">{legend}</h2>
      {hint && <p className="mt-1 text-[0.8125rem] text-paper/60">{hint}</p>}
    </div>
    {children}
  </fieldset>
);

export function ProfileForm({ profile }: { profile: StudentProfile }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, undefined);
  const [subjects, setSubjects] = useState(profile.subjects.length ? profile.subjects : [{ name: "", level: null, grade: null }]);
  const [weights, setWeights] = useState(profile.weights);
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <form action={action} className="space-y-6">
      <Fieldset legend="About you" hint="Used for international-student rules, fees and scholarship eligibility. Optional.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["citizenship", "residence"] as const).map((k) => (
            <label key={k} className="block">
              <span className={labelCls}>{k === "citizenship" ? "Citizenship" : "Country you live in"}</span>
              <select name={k} defaultValue={profile[k] ?? ""} className={inputCls}>
                <option value="">Prefer not to say</option>
                {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </label>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Academics" hint="Your curriculum and subjects are compared with each program's published requirements.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Curriculum</span>
            <select name="curriculum" defaultValue={profile.curriculum ?? ""} className={inputCls}>
              <option value="">Not set</option>
              {CURRICULA.map((c) => <option key={c} value={c}>{CURRICULUM_LABELS[c]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Predicted / actual total</span>
            <input name="predictedTotal" defaultValue={profile.predictedTotal ?? ""} placeholder="e.g. 38 (IB) or 94 (% best of 4)" className={inputCls} />
          </label>
        </div>
        <div>
          <p className={labelCls}>Subjects</p>
          <div className="space-y-2">
            {subjects.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_6rem_5rem_auto] gap-2">
                <input name="subject.name" aria-label={`Subject ${i + 1}`} defaultValue={s.name} placeholder="e.g. Mathematics: Analysis and Approaches" className={inputCls} />
                <input name="subject.level" aria-label={`Subject ${i + 1} level`} defaultValue={s.level ?? ""} placeholder="HL / SL" className={inputCls} />
                <input name="subject.grade" aria-label={`Subject ${i + 1} grade`} defaultValue={s.grade ?? ""} placeholder="Grade" className={inputCls} />
                <button type="button" onClick={() => setSubjects((x) => x.filter((_, j) => j !== i))} aria-label={`Remove subject ${i + 1}`} className="px-2 text-paper/50 hover:text-paper">×</button>
              </div>
            ))}
          </div>
          {subjects.length < 12 && (
            <button type="button" onClick={() => setSubjects((x) => [...x, { name: "", level: null, grade: null }])} className="mt-2 text-[0.875rem] text-cyan">+ Add subject</button>
          )}
        </div>
      </Fieldset>

      <Fieldset legend="Tests" hint="Only what you've taken or are predicted. Leave blank otherwise.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {([["SAT", 400, 1600, 10], ["ACT", 1, 36, 1], ["IELTS", 0, 9, 0.5], ["TOEFL_IBT", 0, 120, 1], ["DUOLINGO", 10, 160, 5]] as const).map(([k, min, max, step]) => (
            <label key={k} className="block">
              <span className={labelCls}>{k.replace("_IBT", " iBT").replace("DUOLINGO", "Duolingo")}</span>
              <input name={k} type="number" min={min} max={max} step={step} defaultValue={profile.tests[k] ?? ""} className={inputCls} />
            </label>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="What you want" hint="Fields, countries and a yearly budget for tuition.">
        <div>
          <p className={labelCls}>Fields you want to study (up to 5)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FIELD_NAMES).map(([k, v]) => (
              <label key={k} className="flex items-center gap-1.5 rounded-full border border-paper/20 px-3 py-1.5 text-[0.8125rem] has-[:checked]:border-electric has-[:checked]:text-electric">
                <input type="checkbox" name="fields" value={k} defaultChecked={profile.fields.includes(k as never)} className="sr-only" /> {v}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className={labelCls}>Countries you&apos;d consider</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.slice(0, 18).map(([c, n]) => (
              <label key={c} className="flex items-center gap-1.5 rounded-full border border-paper/20 px-3 py-1.5 text-[0.8125rem] has-[:checked]:border-electric has-[:checked]:text-electric">
                <input type="checkbox" name="countries" value={c} defaultChecked={profile.countries.includes(c)} className="sr-only" /> {n}
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Max tuition per year (US$)</span>
            <input name="budgetUsdPerYear" type="number" min={0} step={1000} defaultValue={profile.budgetUsdPerYear ?? ""} placeholder="e.g. 30000" className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Career interests</span>
            <input name="careerInterests" defaultValue={profile.careerInterests ?? ""} maxLength={300} placeholder="e.g. economist, product designer" className={inputCls} />
          </label>
        </div>
      </Fieldset>

      <Fieldset legend="What matters most to you" hint="Your weights drive “preference alignment” on each university. It's a preference tool, not an admission chance.">
        <div className="space-y-3">
          {WEIGHT_KEYS.map((k) => (
            <label key={k} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3 text-[0.875rem]">
              <span>{WEIGHT_LABELS[k]}</span>
              <input type="range" name={`w.${k}`} min={0} max={100} step={5} value={weights[k] ?? 0} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))} className="accent-[var(--color-electric)]" />
              <span className="tabular text-right">{total ? Math.round(((weights[k] ?? 0) / total) * 100) : 0}%</span>
            </label>
          ))}
        </div>
      </Fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending} className={primaryBtnCls}>{pending ? "Saving…" : "Save profile"}</button>
        {state?.ok && <p role="status" className="text-verified">✓ Saved. <a href="/discover" className="text-cyan underline">See your discovery →</a></p>}
        {state?.error && <p role="alert" className="text-attention">⚠ {state.error}</p>}
      </div>
    </form>
  );
}
