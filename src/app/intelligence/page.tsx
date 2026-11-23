import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Calculator, Footprints, LayoutTemplate, ShieldCheck, Wand2 } from "lucide-react";
import { site } from "@/lib/site";
import { PageShell, Section, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Intelligence",
  description:
    "AI-powered floor plan generation, spatial reasoning checks, capacity counting and safety validation. Intelligence that works from measurements, not guesses.",
};

export default function IntelligencePage() {
  return (
    <PageShell
      eyebrow="The intelligence layer"
      title="The thinking before the drawing."
      intro="Hallcraft reads a brief, measures a room, checks for overlap and flags blocked exits while the plan is still moving. Intelligence built on spatial reasoning, not vibes."
      meta={`AI-assisted event floor planning. ${site.location}.`}
    >
      <Section title="What the intelligence layer does">
        <p>
          The intelligence layer translates an event brief into a measured first draft, reasons
          about spatial constraints, counts capacity from table arrangements and surfaces safety
          concerns before anything is booked. It doesn't replace a planner's eye - it makes the
          repetitive parts instant and the safety checks automatic.
        </p>
        <p>
          Every suggestion is derived from the actual floor plan geometry: table sizes, clearance
          zones, entrance positions and equipment footprints. The AI explains its reasoning and
          never invents a measurement.
        </p>
      </Section>

      <Section title="Six intelligence passes">
        <div className="space-y-6">
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <Wand2 className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Conversational designer</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                Say what the room needs to do: 300 guests, a central stage, a VIP corner, two clear
                entrances. Get an editable plan back, not a picture of one.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <LayoutTemplate className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Drawings and photos in</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                Bring a venue sketch, an architectural drawing or a phone photo of the room. The
                workspace helps turn what is visible into a working footprint.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <BrainCircuit className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Spatial reasoning pass</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                Overlaps, blocked exits, narrow aisles and wasted pockets of floor are surfaced
                while the plan is still moving, before anything is ordered.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <Calculator className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Capacity, counted</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                Tables, chairs, stages and service equipment are derived from the plan itself.
                Change a table size and the seat count changes with it.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <ShieldCheck className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Safety, flagged early</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                The room check calls out obstructed exits, crowded paths, insufficient spacing and
                accessibility concerns, as recommendations for a human to verify.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#ddd6c8] bg-[#f8f4ea]">
              <Footprints className="h-4.5 w-4.5 text-[#5b4fd6]" />
            </span>
            <div>
              <h3 className="font-semibold text-[#111]">Movement & budget</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-[#5d574c]">
                Model guest and service movement to see where the room bottlenecks, and estimate
                furniture and production against your own prices or vendor list.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="What it doesn't do">
        <Bullets
          items={[
            "It doesn't hallucinate measurements or invent room dimensions",
            "It won't override your design decisions or force a particular layout",
            "It doesn't claim to replace building regulations or qualified safety inspectors",
            "It won't share your plans or brief details with third parties",
          ]}
        />
      </Section>

      <Section title="How to use it">
        <p>
          The intelligence layer is built into the studio workspace. Start a new plan with a brief
          or upload a venue sketch, and Hallcraft returns a measured first draft. As you adjust the
          layout, the spacing checks and capacity counts update automatically.
        </p>
        <p>
          Every intelligence feature runs locally in your browser where possible, and when server
          processing is needed for complex reasoning, your plan data remains private to your
          workspace.
        </p>
      </Section>

      <div className="mt-10 flex flex-wrap items-center gap-3 rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] p-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111]">
          <BrainCircuit className="h-5 w-5 text-[#f8f4ea]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#111]">
            Try the intelligence layer in a live workspace
          </p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#7c7568]">
            Start with a brief or upload a room sketch and see the first draft generate.
          </p>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#111] px-4 py-2 text-[12.5px] font-medium text-[#111] transition-colors hover:bg-[#111] hover:text-[#f7f3e9]"
        >
          Start designing
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <p className="mt-8">
        <Link
          href="/products"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          See the full product breakdown
        </Link>{" "}
        or{" "}
        <Link
          href="/templates"
          className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
        >
          browse event templates
        </Link>
        .
      </p>
    </PageShell>
  );
}
