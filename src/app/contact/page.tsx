import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { site } from "@/lib/site";
import { PageShell, Section } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.company} about Hallcraft — a demo, a venue partnership or help with a plan.`,
};

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Tell us about the room."
      intro="Dimensions, headcount and what has to fit — staging, a dance floor, a bar, sight lines. That is usually enough for us to say whether Hallcraft handles your room."
      meta={`${site.companyLine} ${site.location}.`}
    >
      <Section title="Email">
        <p>
          Write to{" "}
          <a
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>{" "}
          and a person reads it. Mention the venue, the date and the format, and we can talk about
          the plan rather than the product.
        </p>
      </Section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
          { icon: MapPin, label: "Based in", value: site.location },
          { icon: Clock, label: "We reply", value: "Within two working days" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-[#e2dccf] bg-[#f8f4ea] p-4">
              <Icon className="h-4 w-4 text-[#7d9a68]" />
              <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9a9488]">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-1 block text-[11.5px] font-semibold text-[#111] hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-[11.5px] font-semibold text-[#111]">{item.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <Section title="Before you write">
        <p>
          This is a frontend preview: plans, guests and seating stay in your browser and are never
          uploaded. Anything you send by email is read by {site.company} and handled as described in
          the{" "}
          <a
            href="/privacy"
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
          >
            privacy policy
          </a>
          .
        </p>
      </Section>
    </PageShell>
  );
}
