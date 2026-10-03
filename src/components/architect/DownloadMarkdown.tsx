"use client";

import { toMarkdown } from "@/lib/architect/markdown";
import type { SavedProject } from "@/lib/architect/schemas";
import { secondaryBtnCls } from "@/components/forms/styles";

export function DownloadMarkdown({ project }: { project: SavedProject }) {
  return (
    <button
      className={secondaryBtnCls}
      onClick={() => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([toMarkdown(project)], { type: "text/markdown" }));
        a.download = `${project.title.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "blueprint"}.md`;
        a.click();
        URL.revokeObjectURL(a.href);
      }}
    >
      Download as Markdown
    </button>
  );
}
