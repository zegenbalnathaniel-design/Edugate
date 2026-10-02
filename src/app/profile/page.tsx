import type { Metadata } from "next";
import { Container, Section, SectionLabel } from "@/components/primitives/Section";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/user/repo";

export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const profile = await getProfile(user.id);
  return (
    <Section register="deep" className="min-h-screen pt-32 pb-24">
      <Container width="narrow">
        <SectionLabel index="01">Profile</SectionLabel>
        <h1 className="display-m mt-3 mb-3">Tell Edugate what fits you</h1>
        <p className="measure mb-10 text-[0.9375rem] text-paper/65">
          Every field is optional and private to you. The more you add, the more of each university&apos;s published requirements
          Edugate can check for you — anything you leave out simply shows as “unknown”, never as a pass or a fail.
        </p>
        <ProfileForm profile={profile} />
      </Container>
    </Section>
  );
}
