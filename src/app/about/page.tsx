import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageShell, Section, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hallcraft is a floor plan studio for events: draw the room, seat the guests and share an exact plan.", // "Hallcraft is a floor plan studio for events from Ivents: draw the room, seat the guests and share an exact plan.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="Every room only happens once. Plan it to the centimetre."
      intro={`Hallcraft is an event space design studio from ${site.company}. It replaces the sketched layout on the back of a brief with a measured floor plan you can seat, check and share.`}
      meta={`${site.companyLine} ${site.location}.`}
    >
      <Section title="What Hallcraft does">
        <p>
          Draw the room at its real dimensions, place tables, staging, bars and walkways from a
          measured item library, then seat guests against the plan. Hallcraft checks clearances as
          you go, so a layout that looks fine in a sketch does not fail on the night.
        </p>
        <p>
          The finished plan is shareable: the venue, the caterer and the production team all work
          from one version instead of three PDFs and a photograph of a whiteboard.
        </p>
      </Section>

      <Section title="Who it is for">
        <Bullets
          items={[
            "Event planners and producers who need a plan the venue will accept.",
            "Venues that want to see a measured layout before they agree to a booking.",
            "Caterers and production teams who need sight lines, access routes and clearances.",
            "Anyone planning a room that cannot be test-fitted before the day.",
          ]}
        />
      </Section>

      <Section title="How it is built">
        <p>
          Hallcraft is built around real measurements rather than decoration: a plan is only useful
          if the numbers are true. Items carry their footprint and clearance, seats belong to tickets
          and tables, and the plan is the same object the seating chart reads from.
        </p>
        <p>
          This build is a frontend preview. Plans, guests and seating live in your browser and are
          never uploaded.
        </p>
      </Section>

      <Section title="Who builds it">
        <p>
          {site.companyLine} For commercial enquiries, venue partnerships or a walkthrough of a real
          room, write to{" "}
          <a
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
          .
        </p>
      </Section>

      <p>
        <Link
          href="/products"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          See what Hallcraft includes
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          contact the studio
        </Link>
        .
      </p>
    </PageShell>
  );
}
