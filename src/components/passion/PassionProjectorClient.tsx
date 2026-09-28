"use client";

import dynamic from "next/dynamic";

const PassionSessionFlow = dynamic(
  () => import("./PassionSessionFlow").then((m) => m.PassionSessionFlow),
  { ssr: false },
);

export function PassionProjectorClient() {
  return <PassionSessionFlow />;
}
