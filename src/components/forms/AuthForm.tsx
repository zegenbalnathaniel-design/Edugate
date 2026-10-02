"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/lib/auth/actions";
import { inputCls, labelCls, primaryBtnCls } from "./styles";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      {mode === "signup" && (
        <label className="block">
          <span className={labelCls}>Name (optional)</span>
          <input name="name" autoComplete="name" defaultValue={state?.fields?.name} className={inputCls} />
        </label>
      )}
      <label className="block">
        <span className={labelCls}>Email</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={state?.fields?.email} className={inputCls} />
      </label>
      <label className="block">
        <span className={labelCls}>Password{mode === "signup" && " (10+ characters)"}</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 10 : undefined}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={inputCls}
        />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-[var(--radius-md)] border border-attention/50 bg-attention/10 px-3.5 py-2.5 text-[0.875rem] text-paper">
          ⚠ {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${primaryBtnCls} w-full`}>
        {pending ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      <p className="text-center text-[0.875rem] text-paper/60">
        {mode === "login" ? (
          <>New here? <Link className="link-underline text-cyan" href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></>
        ) : (
          <>Already have one? <Link className="link-underline text-cyan" href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link></>
        )}
      </p>
    </form>
  );
}
