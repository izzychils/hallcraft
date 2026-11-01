"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, MapPin, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button, buttonStyles } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useAuth } from "@/features/auth/auth";
import { useDesigns, useDesignsReady } from "@/features/designs/library";
import { getSceneStats, getSceneWarnings } from "@/features/floorplan/geometry";
import { FloorPlanPreview } from "@/features/floorplan/render";

export default function SharedPlanPage() {
  const params = useParams<{ id: string }>();
  const designs = useDesigns();
  const ready = useDesignsReady();
  const { user } = useAuth();
  const design = designs.find((item) => item.id === params.id);

  if (!ready) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f5f2ec]">
        <p className="text-[12px] text-[#8a8376]">Opening shared plan…</p>
      </main>
    );
  }

  if (!design) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f5f2ec] px-6">
        <div className="max-w-sm text-center">
          <Logo href="/" className="justify-center" />
          <h1 className="mt-8 text-3xl font-medium tracking-[-0.04em]">This plan is not here</h1>
          <p className="mt-3 text-[13px] leading-6 text-[#6f695e]">
            Shared links only work in the browser that holds the design. Ask the studio for a fresh
            link, or open the workspace.
          </p>
          <Link href="/dashboard" className={buttonStyles("default", "sm") + " mt-5"}>
            Go to studio
          </Link>
        </div>
      </main>
    );
  }

  const stats = getSceneStats(design.scene);
  const warnings = getSceneWarnings(design.scene);
  const issues = warnings.filter((warning) => warning.severity !== "low");

  return (
    <main className="min-h-dvh bg-[#f5f2ec]">
      <header className="sticky top-0 z-20 border-b border-[#e0d9cb] bg-[#f8f4eb]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-[#8a8376] sm:inline">
              Read-only shared plan
            </span>
            {user ? (
              <Link href={`/studio/${design.id}`} className={buttonStyles("default", "sm")}>
                Open in studio
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <Link href="/login" className={buttonStyles("default", "sm")}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{design.eventType} · Shared floor plan</p>
              <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,2.7rem)] font-medium leading-[1] tracking-[-0.05em]">
                {design.name}
              </h1>
            </div>
            <Badge tone="dark">2D · metres</Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#d8d1c2] bg-[#fbf8f1] shadow-paper">
            <FloorPlanPreview scene={design.scene} className="aspect-[4/3] w-full" />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e6dfd1] px-4 py-2.5 text-[10.5px] text-[#8a8376]">
              <span>
                {design.scene.canvas.width} × {design.scene.canvas.height} m · {stats.elements}{" "}
                objects
              </span>
              <span>
                {issues.length > 0
                  ? `${issues.length} recommendation${issues.length === 1 ? "" : "s"} highlighted`
                  : "No layout issues in the saved version"}
              </span>
            </div>
          </div>

          <p className="mt-3 text-[10.5px] leading-5 text-[#8a8376]">
            Planning reference only. Measurements and recommendations need verification on site by
            the venue and production team.
          </p>
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1] p-4">
            <p className="panel-title">Room sheet</p>
            <dl className="mt-3 space-y-3">
              <Detail icon={<MapPin className="h-3.5 w-3.5" />} label="Venue" value={design.venueName} />
              <Detail
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Event date"
                value={
                  design.eventDate
                    ? new Date(`${design.eventDate}T00:00:00`).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "To confirm"
                }
              />
              <Detail
                icon={<Users className="h-3.5 w-3.5" />}
                label="Guests"
                value={`${design.guestCount} planned · ${stats.seats} seats`}
              />
            </dl>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#e8e2d5] pt-3 text-center">
              <MiniStat label="Tables" value={stats.tables} />
              <MiniStat label="Seats" value={stats.seats} />
              <MiniStat label="Zones" value={stats.zones} />
            </div>
          </div>

          <div className="rounded-2xl border border-[#ddd6c8] bg-[#f8f4ea] p-4">
            <p className="panel-title">On this plan</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {design.collaborators.map((person) => (
                <span
                  key={person.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e0d9ca] bg-[#fbf8f1] py-1 pl-1 pr-2.5 text-[10.5px]"
                >
                  <span
                    className="grid h-5 w-5 place-items-center rounded-full text-[8px] font-semibold text-white"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.initials}
                  </span>
                  {person.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#111111] p-4 text-[#f8f4ea]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#a8a294]">Need changes?</p>
            <p className="mt-2 text-[14px] font-medium leading-5">
              The studio keeps the editable version.
            </p>
            <p className="mt-2 text-[11px] leading-5 text-[#a8a294]">
              Ask Northlight Events to update the plan. Shared links always point at the latest
              saved room.
            </p>
            <Link
              href={user ? `/studio/${design.id}` : "/login"}
              className={buttonStyles("lime", "sm") + " mt-3 w-full"}
            >
              {user ? "Continue editing" : "Sign in to edit"}
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[#8a8376]">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[9.5px] uppercase tracking-[0.12em] text-[#9a9488]">{label}</dt>
        <dd className="mt-0.5 text-[12px] text-[#2f2c25]">{value}</dd>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[17px] font-medium tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[9.5px] uppercase tracking-[0.1em] text-[#9a9488]">{label}</p>
    </div>
  );
}
