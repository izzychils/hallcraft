import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  BrainCircuit,
  Calculator,
  Check,
  Download,
  Footprints,
  LayoutTemplate,
  Palette,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { buttonStyles } from "@/components/ui/button";
import { CursorTag } from "@/components/marketing/name-tag";
import { MarketingNav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { FloorPlanPreview } from "@/features/floorplan/render";
import { TEMPLATE_BY_ID } from "@/features/floorplan/templates";
import { FLOORPLAN_DEFINITIONS } from "@/features/floorplan/constants";
import { DefinitionIcon } from "@/features/floorplan/icons";

const TRUST = ["Northlight Events", "The Foundry", "Dock 9", "Grand Hall", "The Orangery"];

const LIBRARY_ITEMS = [
  "stage",
  "round_table",
  "long_table",
  "dance_floor",
  "bar",
  "screen",
  "photobooth",
  "plant",
]
  .map((id) => FLOORPLAN_DEFINITIONS.find((definition) => definition.id === id))
  .filter((definition): definition is NonNullable<typeof definition> => Boolean(definition));

const FEATURES = [
  {
    icon: Wand2,
    title: "A brief becomes a first draft",
    copy: "Describe the occasion, the guest count and the room. Hallcraft returns a measured starting plan with a stage, seating and service points already in place.",
    tag: "AI floor plans",
  },
  {
    icon: Armchair,
    title: "Seating that adds up",
    copy: "Round, banquet or theatre style. Seat counts stay attached to every table, and the room sheet recalculates the moment a table moves.",
    tag: "Smart seating",
  },
  {
    icon: Route,
    title: "Circulation before decoration",
    copy: "Arrivals, service routes and exits are drawn as zones, not afterthoughts. The plan flags tight aisles and entrances that lose their clearance.",
    tag: "Venue checks",
  },
  {
    icon: Palette,
    title: "Materials, mood and finish",
    copy: "Change the floor, table linen, zone colour and stage finish. The drawing stays technical while the room starts to feel like the event.",
    tag: "Event styling",
  },
  {
    icon: Users,
    title: "One drawing, every department",
    copy: "Planners, production, venue teams and vendors work from the same saved version. Permissions decide who can edit, comment or only view.",
    tag: "Collaboration",
  },
  {
    icon: Download,
    title: "The plan leaves the screen",
    copy: "Export a clean PNG, a printable PDF room sheet or the plan data itself. Everything stays editable, nothing is trapped in a slide deck.",
    tag: "Exports",
  },
];

const INTELLIGENCE = [
  {
    index: "01",
    title: "Conversational designer",
    copy: "Say what the room needs to do: 300 guests, a central stage, a VIP corner, two clear entrances. Get an editable plan back, not a picture of one.",
    icon: Wand2,
  },
  {
    index: "02",
    title: "Drawings and photos in",
    copy: "Bring a venue sketch, an architectural drawing or a phone photo of the room. The workspace helps turn what is visible into a working footprint.",
    icon: LayoutTemplate,
  },
  {
    index: "03",
    title: "Spatial reasoning pass",
    copy: "Overlaps, blocked exits, narrow aisles and wasted pockets of floor are surfaced while the plan is still moving, before anything is ordered.",
    icon: BrainCircuit,
  },
  {
    index: "04",
    title: "Capacity, counted",
    copy: "Tables, chairs, stages and service equipment are derived from the plan itself. Change a table size and the seat count changes with it.",
    icon: Calculator,
  },
  {
    index: "05",
    title: "Safety, flagged early",
    copy: "The room check calls out obstructed exits, crowded paths, insufficient spacing and accessibility concerns, as recommendations for a human to verify.",
    icon: ShieldCheck,
  },
  {
    index: "06",
    title: "Movement & budget",
    copy: "Model guest and service movement to see where the room bottlenecks, and estimate furniture and production against your own prices or vendor list.",
    icon: Footprints,
  },
];

const QUOTES = [
  {
    quote:
      "We used to find the room’s problems on the morning of the build. Now we find them on a Tuesday, three weeks out, over coffee.",
    name: "Amara Okonjo",
    role: "Head of events, Northlight",
    tone: "dark",
  },
  {
    quote:
      "The seating count is the thing. I can move four tables, see the capacity, and know whether the client’s guest list still fits before I reply.",
    name: "Tony Bello",
    role: "Production lead",
    tone: "cream",
  },
  {
    quote:
      "Our venue team and the caterer finally read the same drawing. That alone removed half the site visits.",
    name: "Luis Ferreira",
    role: "Venue manager, The Foundry",
    tone: "lilac",
  },
];

export default function LandingPage() {
  const awardsScene = TEMPLATE_BY_ID.awards.build();
  awardsScene.name = "Aurora Awards 2026";
  const weddingScene = TEMPLATE_BY_ID.wedding.build();
  const galaScene = TEMPLATE_BY_ID.gala.build();

  return (
    <div className="min-h-dvh bg-[#f5f2ec]">
      <MarketingNav />

      {/* Hero: the oversized display type and floating collaborator tags from
          the visual reference, rewritten for spatial planning. */}
      <section className="relative overflow-hidden border-b border-[#e2dccf]">
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#d9f36b]/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1320px] px-5 pb-10 pt-14 sm:pt-16 lg:px-8 lg:pb-14 lg:pt-20">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d0c1] bg-[#f8f4ea] px-3 py-1.5 text-[10.5px] font-medium text-[#5d574c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7d9a68]" />
              Event spatial design, before the build
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#928b7d]">
              Studio preview · 2D plans · localStorage
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.48fr_0.72fr] lg:items-end">
            <div className="relative animate-slide-up">
              <h1 className="display-hero relative text-[clamp(3.35rem,8.4vw,7.35rem)] text-[#11100d]">
                <span className="relative inline-block">
                  <span className="absolute -inset-x-1.5 -inset-y-1 border border-[#5b4fd6]/80 sm:-inset-x-2.5">
                    {["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-bottom-[3px] -left-[3px]", "-bottom-[3px] -right-[3px]"].map(
                      (corner) => (
                        <span
                          key={corner}
                          className={`absolute h-[5px] w-[5px] border border-[#5b4fd6] bg-[#f8f4ea] ${corner}`}
                        />
                      )
                    )}
                  </span>
                  Rooms
                </span>{" "}
                that
                <br />
                hold the
                <br />
                moment.
                <CursorTag
                  name="Maya"
                  color="#7c5cff"
                  className="right-[15%] top-[35%] hidden sm:block"
                  tilt={3}
                />
                <CursorTag
                  name="Tony"
                  color="#4574e8"
                  className="right-[1%] top-[54%] hidden sm:block"
                  tilt={-2}
                />
                <CursorTag
                  name="Luis"
                  color="#f05b35"
                  className="left-[-56px] top-[88%] hidden md:block"
                  tilt={-3}
                />
                <CursorTag
                  name="Sunni"
                  color="#b48cf2"
                  textColor="#241a3d"
                  className="bottom-[6%] right-[7%] hidden md:block"
                  tilt={2}
                />
                <CursorTag
                  name="Mae"
                  color="#2f9a5f"
                  className="right-[1%] top-[-10%] hidden lg:block"
                  tilt={-4}
                />
              </h1>
            </div>

            <div className="max-w-[400px] animate-slide-up lg:justify-self-end lg:pb-5" style={{ animationDelay: "120ms" }}>
              <p className="inline-flex items-center gap-1.5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-[#6f695e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7d9a68]" />
                What Hallcraft does
              </p>
              <p className="mt-2.5 text-pretty text-[15.5px] leading-7 text-[#2b2720] sm:text-[16px] sm:leading-7">
                Hallcraft turns an event brief into a{" "}
                <mark className="bg-[#e8f5a9] px-1 py-0.5 text-[#22260f]">measured, editable floor plan</mark>
                . It seats the guests, checks the room and keeps every department on the same
                drawing.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/signup" className={buttonStyles("default", "default") + " gap-1.5"}>
                  Start designing
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#platform"
                  className="inline-flex items-center gap-1.5 border-b border-[#b7ae9e] pb-1 text-[12px] font-medium text-[#2f2b24] transition-colors hover:border-[#111]"
                >
                  See a live room
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[10.5px] text-[#8a8376]">
                <Check className="h-3 w-3" /> Free to try · no card · your plans stay on this device
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 border-t border-[#ded7c9] pt-5 text-[11px] text-[#7c7568] sm:grid-cols-3">
            <p className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#a29a8b]">01</span>
              Draw a room in metres, not pixels.
            </p>
            <p className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#a29a8b]">02</span>
              Seat the guest list against real tables.
            </p>
            <p className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#a29a8b]">03</span>
              Check the room before the trucks arrive.
            </p>
          </div>
        </div>
      </section>

      {/* Sticky-note board: directly translated from the reference’s three
          note columns, with hand-drawn spatial sketches. */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">One plan, three passes</p>
            <h2 className="mt-3 max-w-xl text-[clamp(2.15rem,4.4vw,3.7rem)] font-medium leading-[0.98] tracking-[-0.055em]">
              A brief becomes a room.
              <br />
              A room becomes a plan.
            </h2>
          </div>
          <p className="max-w-sm text-[12.5px] leading-6 text-[#6f695e]">
            The first sketch is rough. The second has a table count. The third is the version the
            venue can actually build, and all three live in the same file.
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          <NoteColumn label="Brief" count="1" color="#b26cff">
            <div className="relative h-[300px] rotate-[-2.4deg] rounded-[2px] bg-[#ad67f5] p-5 shadow-note transition-transform duration-500 hover:rotate-[-0.8deg] hover:-translate-y-1 sm:h-[330px]">
              <span className="absolute bottom-0 right-0 h-9 w-9 bg-[#f5f2ec]" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
              <svg viewBox="0 0 320 250" className="h-full w-full" aria-hidden="true">
                <g fill="none" stroke="#15110c" strokeWidth="3.2" strokeLinecap="round">
                  <rect x="42" y="34" width="232" height="172" rx="5" />
                  <path d="M84 208v18M238 208v18" opacity="0.5" />
                  <path d="M52 208h220" opacity="0.6" />
                  <path d="M158 34v174" opacity="0.35" strokeDasharray="7 7" />
                  <rect x="92" y="48" width="132" height="30" rx="3" />
                  <path d="M108 60h100" opacity="0.55" />
                  <circle cx="109" cy="118" r="13" />
                  <circle cx="171" cy="118" r="13" />
                  <circle cx="233" cy="118" r="13" />
                  <circle cx="109" cy="166" r="13" />
                  <circle cx="171" cy="166" r="13" />
                  <circle cx="233" cy="166" r="13" />
                  <path d="M145 186c22 0 22 14 0 14M199 81c16 14-6 26 8 35" opacity="0.6" />
                </g>
                <g fill="#15110c">
                  <circle cx="261" cy="51" r="6" />
                  <circle cx="70" cy="91" r="4" />
                </g>
              </svg>
              <p className="absolute bottom-4 left-5 text-[12px] font-medium text-[#1a120b]">
                Brief &amp; flow
              </p>
            </div>
          </NoteColumn>

          <NoteColumn label="Working on it" count="2" color="#f0b62a">
            <div className="relative h-[300px] rotate-[1.6deg] rounded-[2px] bg-[#f3bb25] p-5 shadow-note transition-transform duration-500 hover:rotate-[0.3deg] hover:-translate-y-1 sm:h-[330px]">
              <span className="absolute -left-5 -top-3 h-10 w-16 rotate-[-8deg] bg-[#fbf8f1]/60" />
              <span className="absolute bottom-0 right-0 h-12 w-12 bg-[#f5f2ec]" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
              <svg viewBox="0 0 320 250" className="h-full w-full" aria-hidden="true">
                <g fill="none" stroke="#171209" strokeWidth="3.2" strokeLinecap="round">
                  <path d="M55 54c38-16 58 20 94 7 35-13 55 9 106-10" />
                  <path d="M55 54l-8-12M55 54l-13 3" />
                  <circle cx="83" cy="105" r="9" />
                  <path d="M83 114v28M83 120l-13 9M83 121l15 7" />
                  <circle cx="151" cy="140" r="9" />
                  <path d="M151 149v28M151 155l-13 9M151 156l15 7" />
                  <circle cx="222" cy="176" r="9" />
                  <path d="M222 185v26M222 190l-13 9M222 191l15 7" />
                  <path d="M55 62v156M55 218h214" opacity="0.45" />
                  <rect x="65" y="196" width="56" height="14" rx="3" opacity="0.5" />
                  <path d="M263 48v164M251 80h24M251 140h24" opacity="0.45" />
                </g>
                <g fill="#171209">
                  <circle cx="250" cy="27" r="7" />
                  <path d="M113 47l16-10-2 18-14-8Z" opacity="0.65" />
                </g>
              </svg>
              <p className="absolute bottom-4 left-5 text-[12px] font-medium text-[#1c1308]">
                Layout &amp; seating
              </p>
            </div>
          </NoteColumn>

          <NoteColumn label="Room check" count="3" color="#ff5a2e">
            <div className="relative h-[300px] rotate-[-1.4deg] rounded-[2px] bg-[#ff5c31] p-5 shadow-note transition-transform duration-500 hover:rotate-[0.4deg] hover:-translate-y-1 sm:h-[330px]">
              <span className="absolute bottom-0 right-0 h-10 w-10 bg-[#f5f2ec]" style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }} />
              <svg viewBox="0 0 320 250" className="h-full w-full" aria-hidden="true">
                <g fill="none" stroke="#15110c" strokeWidth="3.2" strokeLinecap="round">
                  <ellipse cx="160" cy="126" rx="93" ry="46" />
                  <ellipse cx="160" cy="126" rx="66" ry="30" />
                  <ellipse cx="160" cy="126" rx="38" ry="16" />
                  <path d="M160 112c-16 0-16 14 0 14s16 14 0 14" />
                  <circle cx="250" cy="91" r="14" />
                  <circle cx="268" cy="126" r="14" />
                  <circle cx="248" cy="160" r="14" />
                  <circle cx="68" cy="82" r="11" />
                  <circle cx="54" cy="122" r="11" />
                  <circle cx="71" cy="158" r="11" />
                  <path d="M226 62c14-12 32-3 26 13" opacity="0.55" />
                  <path d="M40 214c46-12 88 8 136-3 38-9 70 4 106-1" opacity="0.55" />
                </g>
                <g fill="#15110c">
                  <circle cx="275" cy="64" r="6" />
                  <circle cx="45" cy="47" r="4" />
                </g>
              </svg>
              <p className="absolute bottom-4 left-5 text-[12px] font-medium text-[#1c0d08]">
                Production &amp; sign-off
              </p>
            </div>
          </NoteColumn>
        </div>
      </section>

      {/* The lavender/lime highlight sentence and black pill from the
          “A new way to create” reference panel. */}
      <section className="border-y border-[#e2dccf] bg-[#fbf8f1]">
        <div className="mx-auto max-w-[1320px] px-5 py-20 text-center lg:px-8 lg:py-28">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7c7568]">
            Introducing Hallcraft AI
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl text-[clamp(2.5rem,5.7vw,4.9rem)] font-medium leading-[1.02] tracking-[-0.055em]">
            A new{" "}
            <span className="highlight-word bg-[#cdb8f8] pb-0.5 text-[#382650]">way</span> to{" "}
            <span className="highlight-word bg-[#dcf46f] pb-0.5 text-[#2b3210]">plan</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[13px] leading-6 text-[#6f695e]">
            Start with a sentence, a sketch or a room full of constraints. The planner drafts the
            first measured version, then hands you every lever to change it.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-[12px] font-medium text-[#f8f4ea] transition-colors hover:bg-[#2b2924]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#d9f36b]" />
              Draft your first room
            </Link>
            <a
              href="#intelligence"
              className="inline-flex items-center gap-1.5 px-2 py-2 text-[11.5px] text-[#5d574c] underline decoration-[#c6bdad] underline-offset-4 hover:decoration-[#111]"
            >
              How the planner thinks
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#e4ddcf] bg-[#f6f1e6] px-4 py-3 text-left">
            <p className="text-[9.5px] uppercase tracking-[0.14em] text-[#9a9488]">A real brief</p>
            <p className="mt-1.5 font-mono text-[10.5px] leading-5 text-[#49443a] sm:text-[11.5px]">
              “A 200-guest awards dinner in a 26 × 34 m hall. Central stage, round tables, a VIP
              corner by the terrace, catering kept separate, two clear entrances.”
            </p>
          </div>
        </div>
      </section>

      {/* Product frame. The plan itself is a live SVG generated by the same
          engine the studio uses. */}
      <section id="platform" className="relative overflow-hidden">
        <div className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow">The platform</p>
              <h2 className="mt-3 max-w-2xl text-[clamp(2rem,3.7vw,3.1rem)] font-medium leading-[0.98] tracking-[-0.055em]">
                Drawn to scale.
                <br />
                Built for the room.
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-[12.5px] leading-6 text-[#6f695e]">
                A technical 2D canvas with editable objects, live seating, room checks and a
                printable sheet. No 3D goggles required to make a decision.
              </p>
              <Link
                href="/signup"
                className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#2a2720] underline decoration-[#c2b9a9] underline-offset-4 hover:decoration-[#111]"
              >
                Open the studio
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-8 max-w-[1120px]">
            <div className="overflow-hidden rounded-2xl border border-[#cfc6b6] bg-[#fbf8f1] shadow-[0_40px_90px_-50px_rgba(28,23,15,0.55)]">
              <div className="flex h-10 items-center justify-between gap-3 border-b border-[#e2dbcd] bg-[#f8f4eb] px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <LogoMark className="h-6 w-6 rounded-[6px]" />
                  <span className="truncate text-[10.5px] font-medium">Aurora Awards 2026</span>
                  <span className="hidden rounded-full bg-[#e9f1df] px-1.5 py-0.5 text-[8px] font-medium text-[#536c41] sm:inline">
                    Saved just now
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-md bg-[#ece7db] p-0.5">
                  <span className="rounded bg-[#fffdf8] px-2 py-0.5 text-[9px] font-medium shadow-sm">
                    2D
                  </span>
                  <span className="px-2 py-0.5 text-[9px] text-[#a39b8d]">3D · later</span>
                </div>
                <div className="flex -space-x-1">
                  {[
                    { initials: "TB", color: "#7c5cff" },
                    { initials: "MO", color: "#2f9a5f" },
                    { initials: "SP", color: "#b48cf2" },
                  ].map((person) => (
                    <span
                      key={person.initials}
                      className="grid h-5 w-5 place-items-center rounded-full text-[7px] font-semibold text-white ring-2 ring-[#f8f4eb]"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.initials}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-h-[360px] grid-cols-[1fr] md:grid-cols-[164px_1fr_172px]">
                <div className="hidden border-r border-[#e5dfd2] bg-[#f8f4eb] p-2.5 md:block">
                  <p className="px-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#9a9488]">
                    Add to plan
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {LIBRARY_ITEMS.map((definition) => (
                      <div
                        key={definition.id}
                        className="rounded border border-[#e4ddce] bg-[#fbf8f1] p-1.5"
                      >
                        <span
                          className="grid h-5 w-5 place-items-center rounded-sm border border-[#e7e0d1]"
                          style={{ backgroundColor: definition.defaultStyle.fill }}
                        >
                          <DefinitionIcon name={definition.icon} className="h-2.5 w-2.5 text-[#5a5346]" />
                        </span>
                        <p className="mt-1 truncate text-[7.5px] font-medium leading-3">
                          {definition.name.replace(" screen", "")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 rounded bg-[#111] px-2 py-2">
                    <p className="text-[8px] font-medium text-[#f8f4ea]">Describe the room</p>
                    <p className="mt-0.5 text-[7px] leading-3 text-[#a8a294]">
                      Draft a layout from your brief
                    </p>
                  </div>
                </div>

                <div className="relative h-[460px] overflow-hidden bg-[#e9e3d7]">
                  <FloorPlanPreview
                    scene={awardsScene}
                    className="h-full w-full"
                    preserveAspectRatio="xMidYMax slice"
                  />
                  <span className="absolute bottom-2.5 left-2.5 rounded bg-[#fbf8f1]/95 px-1.5 py-0.5 text-[7.5px] text-[#6f695e] shadow-sm">
                    22 × 30 m · 12 objects
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 flex items-center gap-0.5 rounded border border-[#d8d1c3] bg-[#fbf8f1]/95 px-1 py-0.5 text-[7.5px] text-[#5d574c] shadow-sm">
                    <span className="grid h-3.5 w-3.5 place-items-center">−</span>
                    <span>100%</span>
                    <span className="grid h-3.5 w-3.5 place-items-center">+</span>
                  </span>
                  <CursorTag
                    name="Maya"
                    color="#7c5cff"
                    className="left-[56%] top-[28%] !absolute"
                    tilt={-2}
                  />
                </div>

                <div className="hidden border-l border-[#e5dfd2] bg-[#f8f4eb] p-2.5 md:block">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#9a9488]">
                    Round table
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded border border-[#ded7c8] bg-[#fffdf8]">
                      <Armchair className="h-2.5 w-2.5" />
                    </span>
                    <span className="text-[9px] font-medium">T5 · 10 seats</span>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {[
                      ["X", "4.1 m"],
                      ["Y", "19.7 m"],
                      ["Width", "3.0 m"],
                      ["Depth", "3.0 m"],
                      ["Rotation", "0°"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded border border-[#e4ddce] bg-[#fbf8f1] px-1.5 py-1">
                        <span className="text-[7.5px] text-[#918a7c]">{label}</span>
                        <span className="text-[7.5px] font-medium tabular-nums">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1">
                    {["#fffdf8", "#f3e9da", "#e7eee2", "#efe6f3", "#ffd9c9"].map((color) => (
                      <span
                        key={color}
                        className="h-3 w-3 rounded-full border border-[#d7d1c4]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 rounded border border-[#d7e2cb] bg-[#edf3e5] px-1.5 py-1">
                    <p className="flex items-center gap-1 text-[7.5px] font-medium text-[#4d6b3b]">
                      <Check className="h-2 w-2" /> Plan looks clear
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Real footprints", "Every object has a measured footprint, not a sticker."],
              ["Live capacity", "Seats update with tables, tables update with the room."],
              ["Printable sheets", "PNG, PDF or raw plan data, ready for the site meeting."],
            ].map(([title, copy], index) => (
              <div
                key={title}
                className="flex gap-3 border-t border-[#dcd5c7] pt-3 text-[11px] leading-5"
              >
                <span className="font-mono text-[9px] text-[#a29a8b]">0{index + 1}</span>
                <p className="text-[#7c7568]">
                  <span className="mb-0.5 block font-medium text-[#2f2b24]">{title}</span>
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teal statement with floating category pills, following the fourth
          reference image. */}
      <section className="relative overflow-hidden bg-[#0d4a45] py-20 text-[#9fe5dd] lg:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg viewBox="0 0 1200 600" className="h-full w-full">
            <g fill="none" stroke="#d7fff8" strokeWidth="1">
              <path d="M0 120h1200M0 240h1200M0 360h1200M0 480h1200" />
              <path d="M200 0v600M440 0v600M680 0v600M920 0v600" />
            </g>
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1100px] px-5 lg:px-8">
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="absolute -left-3 top-3 hidden rotate-[-6deg] rounded-[3px] bg-[#171510] px-3 py-1.5 text-[10.5px] font-medium text-[#f5f2ec] shadow-note lg:block">
              Stage &amp; sightlines
            </span>
            <span className="absolute right-0 top-[-28px] hidden rotate-[3deg] rounded-[3px] bg-[#ffd84d] px-3 py-1.5 text-[10.5px] font-medium text-[#231d0b] shadow-note lg:block">
              Weddings
            </span>
            <span className="absolute -left-10 bottom-16 hidden rotate-[4deg] rounded-full bg-[#fbf8f1] px-3 py-1.5 text-[10.5px] font-medium text-[#231f18] shadow-note lg:block">
              Conferences
            </span>
            <span className="absolute -right-6 bottom-24 hidden rotate-[-3deg] rounded-full bg-[#f2385a] px-3 py-1.5 text-[10.5px] font-medium text-[#fff5f2] shadow-note lg:block">
              Galas
            </span>
            <span className="absolute right-[12%] bottom-[-8px] hidden rotate-[2deg] rounded-full border border-[#8bc9bf]/60 px-3 py-1.5 text-[10.5px] font-medium text-[#c5f2e8] lg:block">
              Exhibitions
            </span>

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7fb9ae]">
              One room, many occasions
            </p>
            <h2 className="mx-auto mt-6 text-[clamp(2.9rem,7vw,6.2rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#7ee5dc]">
              Helping rooms
              <br />
              hold more.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[12.5px] leading-6 text-[#a9d6c9]">
              A wedding on Friday, a conference on Monday, a gala the week after. One venue plan
              that keeps up with every version of the room.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:hidden">
              {["Stage & sightlines", "Weddings", "Conferences", "Galas", "Exhibitions"].map(
                (label, index) => (
                  <span
                    key={label}
                    className={`rounded-full px-3 py-1.5 text-[10.5px] font-medium ${
                      index === 0
                        ? "bg-[#171510] text-[#f5f2ec]"
                        : index === 1
                          ? "bg-[#ffd84d] text-[#231d0b]"
                          : index === 2
                            ? "bg-[#fbf8f1] text-[#231f18]"
                            : index === 3
                              ? "bg-[#f2385a] text-[#fff5f2]"
                              : "border border-[#8bc9bf]/50 text-[#c5f2e8]"
                    }`}
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
            <Link
              href="/dashboard/templates"
              className="mt-8 inline-flex items-center gap-1.5 border-b border-[#6fae9f] pb-1 text-[11.5px] font-medium text-[#d9fff5] transition-colors hover:border-[#d9fff5]"
            >
              See the starting plans
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Everything after the brief</p>
            <h2 className="mt-3 max-w-2xl text-[clamp(2.15rem,4.4vw,3.7rem)] font-medium leading-[0.98] tracking-[-0.055em]">
              The whole room,
              <br />
              considered.
            </h2>
          </div>
          <p className="max-w-sm text-[12.5px] leading-6 text-[#6f695e]">
            The drawing is the start. Hallcraft keeps the numbers, the people and the practical
            checks attached to it.
          </p>
        </div>

        <div className="mt-10 grid border-t border-[#d9d2c4] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <article
              key={feature.title}
              className="group border-b border-[#d9d2c4] px-0 py-6 sm:px-5 sm:odd:pl-0 lg:px-5 lg:first:pl-0"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d0c1] bg-[#fbf8f1] transition-colors group-hover:border-[#111] group-hover:bg-[#111] group-hover:text-[#f7f3e9]">
                  <feature.icon className="h-3.5 w-3.5" />
                </span>
                <span className="font-mono text-[9px] text-[#a29a8b]">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-8 text-[10px] uppercase tracking-[0.14em] text-[#9a9284]">
                {feature.tag}
              </p>
              <h3 className="mt-2 max-w-[280px] text-[17px] font-medium leading-[1.15] tracking-[-0.025em]">
                {feature.title}
              </h3>
              <p className="mt-2.5 max-w-[320px] text-[11.5px] leading-5 text-[#756e61]">
                {feature.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Intelligence layer */}
      <section id="intelligence" className="border-y border-[#e2dccf] bg-[#fbf8f1]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
          <div>
            <p className="eyebrow">The intelligence layer</p>
            <h2 className="mt-3 text-[clamp(2.15rem,4.2vw,3.6rem)] font-medium leading-[0.98] tracking-[-0.055em]">
              The thinking
              <br />
              behind the drawing.
            </h2>
            <p className="mt-4 max-w-md text-[12.5px] leading-6 text-[#6f695e]">
              A plan is more than shapes on a floor. Hallcraft reads the room for capacity,
              movement, safety and cost, then gives the decision back to you.
            </p>
            <div className="mt-6 rounded-xl border border-[#e2dbcd] bg-[#f6f1e6] p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-[#7c7568]">
                <ShieldCheck className="h-3.5 w-3.5" />
                A note on the recommendations
              </p>
              <p className="mt-2 text-[10.5px] leading-5 text-[#857e70]">
                Checks are planning guidance, not a compliance certificate. Every flag needs a
                human, whether the venue, the fire officer or the production lead, before it is
                treated as fact.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d9f36b]">
                <Sparkles className="h-4 w-4 text-[#3d461a]" />
              </span>
              <p className="max-w-[220px] text-[10.5px] leading-5 text-[#7c7568]">
                Drafts in seconds. Edits by hand. The studio never changes a plan without you.
              </p>
            </div>
          </div>

          <div className="border-t border-[#ddd6c8]">
            {INTELLIGENCE.map((item) => (
              <article
                key={item.index}
                className="group grid grid-cols-[28px_1fr] gap-4 border-b border-[#ddd6c8] py-5 transition-colors hover:bg-[#f5efe3] sm:grid-cols-[32px_32px_1fr] sm:px-2"
              >
                <span className="pt-0.5 font-mono text-[9px] text-[#a29a8b]">{item.index}</span>
                <span className="hidden h-7 w-7 place-items-center rounded-full border border-[#ddd6c8] text-[#6f695e] transition-colors group-hover:border-[#111] group-hover:text-[#111] sm:grid">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-[14px] font-medium tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-1 max-w-lg text-[11px] leading-5 text-[#7c7568]">{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Templates</p>
            <h2 className="mt-3 text-[clamp(2.15rem,4.4vw,3.6rem)] font-medium leading-[0.98] tracking-[-0.055em]">
              A running start,
              <br />
              measured in metres.
            </h2>
          </div>
          <Link
            href="/dashboard/templates"
            className={buttonStyles("outline", "sm") + " gap-1.5 bg-[#fbf8f1]"}
          >
            Browse all templates
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            { scene: awardsScene, title: "Corporate awards", meta: "22 × 30 m · 160 guests", tone: "bg-[#fbf8f1]" },
            { scene: weddingScene, title: "Garden wedding", meta: "20 × 30 m · 120 guests", tone: "bg-[#fbf8f1]" },
            { scene: galaScene, title: "Winter gala", meta: "26 × 34 m · 200 guests", tone: "bg-[#fbf8f1]" },
          ].map((template) => (
            <article
              key={template.title}
              className="group overflow-hidden rounded-xl border border-[#dcd5c7] bg-[#fbf8f1] transition-all hover:-translate-y-0.5 hover:shadow-paper"
            >
              <div className="h-48 overflow-hidden border-b border-[#e5dfd1] bg-[#f1ebdf]">
                <FloorPlanPreview
                  scene={template.scene}
                  showGrid={false}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3.5">
                <div>
                  <h3 className="text-[12.5px] font-medium">{template.title}</h3>
                  <p className="mt-0.5 text-[10px] text-[#8a8376]">{template.meta}</p>
                </div>
                <Link
                  href="/dashboard/templates"
                  className="grid h-7 w-7 place-items-center rounded-full border border-[#d8d1c3] text-[#6f695e] transition-colors group-hover:border-[#111] group-hover:bg-[#111] group-hover:text-[#fbf8f1]"
                  aria-label={`Use ${template.title} template`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quotes */}
      <section id="story" className="border-y border-[#e2dccf] bg-[#fbf8f1]">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">From the room</p>
              <h2 className="mt-3 text-[clamp(2.15rem,4.2vw,3.4rem)] font-medium leading-[1] tracking-[-0.055em]">
                The people who build it
                <br />
                should see it first.
              </h2>
            </div>
            <p className="max-w-xs text-[12px] leading-6 text-[#6f695e]">
              Planners, production teams and venues, working from one saved version instead of
              six attachments.
            </p>
          </div>

          <div className="mt-9 grid gap-3 md:grid-cols-3">
            {QUOTES.map((quote) => (
              <figure
                key={quote.name}
                className={`flex min-h-[230px] flex-col justify-between rounded-xl border p-5 ${
                  quote.tone === "dark"
                    ? "border-[#171510] bg-[#171510] text-[#f5f1e6]"
                    : quote.tone === "lilac"
                      ? "border-[#d8c8ef] bg-[#e7dcfa] text-[#241b35]"
                      : "border-[#ddd6c8] bg-[#f8f4ea] text-[#232019]"
                }`}
              >
                <blockquote className="text-[13px] leading-6 tracking-[-0.01em]">
                  “{quote.quote}”
                </blockquote>
                <figcaption
                  className={`mt-6 flex items-center gap-2.5 border-t pt-3 text-[10.5px] ${
                    quote.tone === "dark" ? "border-white/15" : "border-black/10"
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full ${
                      quote.tone === "dark"
                        ? "bg-[#d9f36b]"
                        : quote.tone === "lilac"
                          ? "bg-[#7c5cff]"
                          : "bg-[#f05b35]"
                    }`}
                  />
                  <span>
                    <strong className="block font-medium">{quote.name}</strong>
                    <span
                      className={
                        quote.tone === "dark" ? "text-[#a8a294]" : "text-[#857e70]"
                      }
                    >
                      {quote.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#111111] px-6 py-12 text-[#f7f3e9] sm:px-10 lg:px-14 lg:py-16">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#d9f36b]/20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-[#7c5cff]/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#938d7f]">
                No blank canvas anxiety
              </p>
              <h2 className="mt-4 max-w-2xl text-[clamp(2.3rem,5vw,4.4rem)] font-medium leading-[0.95] tracking-[-0.055em]">
                Start with the room
                <br />
                you already have.
              </h2>
              <p className="mt-4 max-w-md text-[12px] leading-6 text-[#a8a294]">
                Bring the venue’s dimensions, the guest count and the idea. Hallcraft brings the
                first measured plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/signup" className={buttonStyles("lime", "lg") + " gap-1.5"}>
                Start free
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-white/20 px-4 text-[12px] font-medium text-[#f7f3e9] transition-colors hover:bg-white/10"
              >
                Explore the demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function NoteColumn({
  label,
  count,
  color,
  children,
}: {
  label: string;
  count: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[12px] font-medium text-[#343026]">{label}</span>
        <span className="ml-auto font-mono text-[10px] text-[#9a9284]">{count}</span>
      </div>
      {children}
    </div>
  );
}
