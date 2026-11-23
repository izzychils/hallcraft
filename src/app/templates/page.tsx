import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { site } from "@/lib/site";
import { PageShell, Section, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Pre-built event floor plan templates for weddings, conferences, galas and corporate events. Start with a measured layout and adjust to your venue.",
};

export default function TemplatesPage() {
  return (
    <PageShell
      eyebrow="Templates"
      title="A running start, measured in metres."
      intro="Every template is a real, editable plan with stage, seating, service points and clear arrival routes. Use the shape, then bend it to the venue."
      meta={`Browse templates inside the studio. ${site.location}.`}
    >
      <Section title="What you get">
        <p>
          Hallcraft templates are actual floor plans, not sketches. Each template includes measured
          furniture from the item library, guest seating laid out to table assignments, clearance
          checks and zones for arrival, service and production.
        </p>
        <p>
          Once opened, the template becomes your design: adjust table count, swap items, move the
          stage or add a bar. Every change is reflected immediately in the capacity, the spacing
          checks and the shareable plan link.
        </p>
      </Section>

      <Section title="Occasions covered">
        <Bullets
          items={[
            "Corporate events and award nights",
            "Weddings and celebrations",
            "Conferences and summits",
            "Exhibition launches and product reveals",
          ]}
        />
      </Section>

      <Section title="How to use them">
        <p>
          Templates are accessed from inside the studio workspace. Log in, navigate to Templates,
          and choose a layout that matches your guest count and venue shape. The plan opens in the
          editor where you can seat guests, adjust furniture and check clearances before sharing
          with the venue.
        </p>
      </Section>

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111]">
          <LayoutGrid className="h-5 w-5 text-[#f8f4ea]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#111]">
            Browse templates inside the studio
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#7c7568]">
            Log in to access the full template library and start editing a plan immediately.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#111] px-4 py-2 text-[12.5px] font-medium text-[#111] transition-colors hover:bg-[#111] hover:text-[#f7f3e9]"
        >
          Go to studio
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="mt-8">
        <Link
          href="/products"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          See what else Hallcraft includes
        </Link>{" "}
        or{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          create a free workspace
        </Link>
        .
      </p>
    </PageShell>
  );
}
