import { permanentRedirect } from "next/navigation";
import { getUniversity } from "@/lib/unis/repo";

/** Old fixture route — universities now live at /universities/[slug]. */
export default async function OldCollegeRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect((await getUniversity(slug)) ? `/universities/${slug}` : "/universities");
}
