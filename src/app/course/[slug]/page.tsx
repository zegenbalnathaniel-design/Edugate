import { permanentRedirect } from "next/navigation";

/** Old fixture route — programs now live under /universities/[slug]/programs. */
export default function OldCourseRoute() {
  permanentRedirect("/universities");
}
