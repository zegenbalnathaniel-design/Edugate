import Link from "next/link";
import type { Course } from "@/lib/data/types";
import { FIELD_LABELS } from "@/lib/data/types";
import { Provenance } from "@/components/primitives/Provenance";

const DEGREE_LABEL: Record<Course["degree"], string> = {
  diploma: "Diploma",
  bachelors: "Bachelor's",
  integrated: "Integrated",
  masters: "Master's",
  doctoral: "Doctoral",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/course/${course.slug}`}
      className="glass glass-interactive glow-border block p-6"
    >
      <p className="meta text-current/45">
        {DEGREE_LABEL[course.degree]} · {FIELD_LABELS[course.field]}
      </p>
      <h3 className="mt-1 text-[1.0625rem] font-medium text-current">{course.name}</h3>
      <p className="mt-2 text-[0.8125rem] text-current/55">
        {Math.round(course.durationMonths / 12) >= 1
          ? `${(course.durationMonths / 12).toFixed(course.durationMonths % 12 === 0 ? 0 : 1)} years`
          : `${course.durationMonths} months`}
        {" · "}
        {course.fees.currency} {course.fees.min.toLocaleString()}–{course.fees.max.toLocaleString()} / {course.fees.period}
      </p>
      <Provenance kind={course.provenance} className="mt-4" />
    </Link>
  );
}
