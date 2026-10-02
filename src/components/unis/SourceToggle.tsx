"use client";

import { useId, useState, type ReactNode } from "react";

export function SourceToggle({
  children,
  dot,
  label,
  asOf,
  notes,
  source,
}: {
  children: ReactNode;
  dot: string;
  label: string;
  asOf: string | null;
  notes: string | null;
  source: { label: string; url: string; type: string; retrieved: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="inline">
      <span>{children}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className={`ml-1.5 inline-flex translate-y-[-1px] items-center gap-1 align-middle text-[0.6875rem] ${open ? "text-cyan" : "text-current/45 hover:text-current"}`}
      >
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        <span aria-hidden>ⓘ</span>
        <span className="sr-only">{open ? "Hide source" : "Show source"}</span>
      </button>
      {open && (
        <span id={id} className="mt-2 block rounded-[var(--radius-md)] border border-current/15 bg-current/[0.04] p-3 text-[0.8125rem] leading-relaxed">
          <span className="block font-medium">{label}{asOf ? ` · ${asOf}` : ""}</span>
          {source && (
            <span className="mt-1 block">
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-underline text-cyan">{source.label}</a>
              <span className="text-current/55"> · {source.type} · retrieved {source.retrieved}</span>
            </span>
          )}
          {notes && <span className="mt-1 block text-current/70">{notes}</span>}
        </span>
      )}
    </span>
  );
}
