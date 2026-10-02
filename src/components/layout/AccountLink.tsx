"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { signedIn: boolean; name?: string | null; role?: string };

/** Fetches sign-in state client-side so static pages stay static. */
export function AccountLink({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [me, setMe] = useState<Me | null>(null);
  const path = usePathname();
  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Me) => live && setMe(d))
      .catch(() => live && setMe({ signedIn: false }));
    return () => {
      live = false;
    };
  }, [path]);
  if (!me) return <span className={`${className} invisible`}>Sign in</span>;
  return me.signedIn ? (
    <Link href="/account" onClick={onNavigate} className={className}>{me.name?.split(" ")[0] || "Your account"}</Link>
  ) : (
    <Link href={`/login?next=${encodeURIComponent(path)}`} onClick={onNavigate} className={className}>Sign in</Link>
  );
}
