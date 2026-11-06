import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageShell, Section, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles floor plans, guest lists and seating. This preview build keeps everything in your browser.`,
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy Policy"
      title="A floor plan can name a person. We treat it that way."
      intro={`${site.name} is currently a frontend preview with no backend and no analytics service connected. This page explains exactly what that means for the plans and guest lists you build here.`}
      meta={`Last updated ${site.lastUpdated}`}
    >
      <Section title="Who we are">
        <p>
          {site.name} is a product of {site.company}, {site.location}. For any privacy question, or
          to ask that something be removed, write to{" "}
          <a
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
          .
        </p>
      </Section>

      <Section title="What the preview stores">
        <p>
          Floor plans, items, guests and seating assignments are kept in your browser's local
          storage on the device you used. Nothing is sent to a {site.name} server and no plan is
          uploaded anywhere.
        </p>
      </Section>

      <Section title="What we do not collect">
        <Bullets
          items={[
            "No analytics, advertising identifiers or tracking pixels.",
            "No payment or card details.",
            "No uploaded files are transmitted or stored.",
            "No guest list is shared with a venue unless you share the plan yourself.",
            "No location data beyond the address you type into the plan.",
          ]}
        />
      </Section>

      <Section title="Guest and attendee data">
        <p>
          Seating charts often include names, dietary needs or accessibility requirements — personal
          data about people who have not agreed to use our software. In a live deployment, client
          data would be scoped to the event and to the account that owns it, exported only by those
          accounts, and never used for anything else.
        </p>
        <p>
          If you enter other people's details into a shared plan, you are responsible for having a
          basis to do so.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          Clear site data for this address in your browser settings to remove every plan and guest
          list the preview stored. To make a request about information you sent us by email, use the
          address above.
        </p>
      </Section>

      <section className="rounded-xl border border-[#e2dccf] bg-[#f8f4ea] p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9a9488]">
          Preview note
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#6f695e]">
          This policy describes a prototype build and is not legal advice. It should be reviewed
          before a production launch.
        </p>
      </section>
    </PageShell>
  );
}
