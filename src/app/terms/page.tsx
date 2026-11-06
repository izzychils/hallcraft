import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageShell, Section, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply to using ${site.name}, an event floor plan studio from ${site.company}.`,
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of Service"
      title="What you can expect from us, and what we expect from you."
      intro={`These terms govern your use of ${site.name}, an event space design studio from ${site.company}. By using the site you accept them.`}
      meta={`Last updated ${site.lastUpdated}`}
    >
      <Section title="Who you are agreeing with">
        <p>
          {site.name} is operated by {site.company}, {site.location}. Where these terms say "we" or
          "us", that is {site.company}; "you" means the person or business using the site.
        </p>
      </Section>

      <Section title="This is a preview build">
        <p>
          The current site is a frontend preview with no backend. Plans, guests and seating live only
          in your browser and disappear if you clear site data. No fee is charged and no service
          obligation is created by using the preview.
        </p>
      </Section>

      <Section title="A plan is not a safe structure">
        <p>
          {site.name} checks dimensions and clearances from the values you enter. It does not certify
          structural safety, fire capacity, licensing or accessibility compliance. A plan produced
          here still needs the venue's approval and, where required, a qualified professional's
          sign-off before the room is built.
        </p>
        <p>
          You are responsible for the accuracy of the room's measurements and of the items you place
          in it.
        </p>
      </Section>

      <Section title="Acceptable use">
        <Bullets
          items={[
            "Use the studio to plan events you are responsible for.",
            "Do not enter other people's personal data without a basis to do so.",
            "Do not attempt to disrupt, reverse engineer or overload the site or its infrastructure.",
            "Do not copy the library, design or code into another product without permission.",
            "Do not present a preview plan as a certified capacity or safety assessment.",
          ]}
        />
      </Section>

      <Section title="Accounts">
        <p>
          Sign-in on this build is local to your browser. Where real accounts exist, you are
          responsible for keeping credentials secure and for activity under your account, and you
          must tell us promptly if you believe access has been compromised.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The {site.name} name, design, item library, copy and code belong to {site.company} or its
          licensors. Your plans, guest lists and photographs remain yours; you grant us only the
          permission needed to display and share them for you.
        </p>
      </Section>

      <Section title="Availability and changes">
        <p>
          The preview is provided as is, without warranties of any kind. We may change, suspend or
          withdraw it at any time. We may update these terms; the date at the top of this page will
          change when we do.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent the law allows, {site.company} is not liable for indirect or consequential
          loss, lost profits, lost data or the outcome of an event planned with a layout produced
          here. Nothing limits liability that cannot lawfully be limited.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          Contact{" "}
          <a
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>{" "}
          about these terms, or read the{" "}
          <a
            href="/privacy"
            className="font-semibold text-[#111] underline decoration-[#c9c1b0] underline-offset-2 hover:decoration-[#7d9a68]"
          >
            privacy policy
          </a>
          .
        </p>
      </Section>

      <section className="rounded-xl border border-[#e2dccf] bg-[#f8f4ea] p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9a9488]">
          Preview note
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-[#6f695e]">
          These terms cover a prototype build and are not legal advice. They should be reviewed by a
          qualified lawyer before a production launch.
        </p>
      </section>
    </PageShell>
  );
}
