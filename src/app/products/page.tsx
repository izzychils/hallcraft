import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageShell, Section } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Products",
  description:
    "What Hallcraft includes: the measured floor plan studio, the item library, seating and guest management, and a shareable plan.",
};

const products = [
  {
    name: "Floor plan studio",
    audience: "For planners and venues",
    copy: "Draw a room at its real dimensions and place staging, tables, bars and walkways. Clearances are checked as you move things, so an attractive layout is also a workable one.",
    points: ["Real dimensions", "Live clearance checks", "Version history"],
  },
  {
    name: "Item library",
    audience: "For the people who build the room",
    copy: "A measured catalogue of tables, chairs, staging, rigging and bars with footprints and access needs — the difference between a mood board and a plan.",
    points: ["Measured footprints", "Clearance rules", "Reusable across events"],
  },
  {
    name: "Seating and guests",
    audience: "For the front of house",
    copy: "Seats belong to tables and tickets. Drag a guest to a seat and the plan, the chart and the name cards stay in agreement instead of drifting apart.",
    points: ["Guest to seat mapping", "Table composition", "Check-in friendly"],
  },
  {
    name: "Shareable plan",
    audience: "For everyone else",
    copy: "Send one exact plan instead of a sketch and a description. The venue, caterer and production team all read the same measurements.",
    points: ["One shared version", "Print-accurate export", "No guest list exposed"],
  },
];

export default function ProductsPage() {
  return (
    <PageShell
      eyebrow="Products"
      title="Four parts of one measured plan."
      intro="Hallcraft is a single studio. The plan, the library, the seating and the share all read the same measurements, so nothing drifts between them."
      meta={`${site.companyLine} Preview build.`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <div key={product.name} className="rounded-xl border border-[#e2dccf] bg-[#f8f4ea] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[14.5px] font-semibold text-[#111]">{product.name}</h2>
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9a9488]">
                {product.audience}
              </span>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-[#6f695e]">{product.copy}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {product.points.map((point) => (
                <li
                  key={point}
                  className="rounded-full border border-[#e2dccf] bg-[#fdfbf6] px-2.5 py-1 text-[10px] text-[#6f695e]"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Section title="Who Hallcraft serves">
        <p>
          Planners producing one-off rooms, venues that need a measured layout before agreeing a
          booking, and the production teams who have to make the drawing real. If your layout
          currently travels as a photograph of a sketch, that is the problem Hallcraft removes.
        </p>
      </Section>

      <Section title="Occasions">
        <p>
          Awards nights, weddings, galas, conferences, exhibitions and launches — anywhere seating,
          sight lines and access routes all have to be true at the same time.
        </p>
      </Section>

      <p>
        <Link
          href="/contact"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          Talk to {site.company}
        </Link>{" "}
        or{" "}
        <Link
          href="/dashboard"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          open the studio
        </Link>
        .
      </p>
    </PageShell>
  );
}
