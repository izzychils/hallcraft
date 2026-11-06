import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingNav } from "./nav";
import { Footer } from "./footer";

/**
 * Shared layout for the marketing detail pages (about, products, contact,
 * privacy, terms) so they inherit the same navigation, type scale and footer
 * as the landing page.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f2ec]">
      <MarketingNav />
      <main>
        <section className="border-b border-[#e2dccf] bg-[#f8f4ea] pb-12 pt-10 sm:pb-16 sm:pt-14">
          <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
            <Link
              href="/"
              className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#9a9488] transition-colors hover:text-[#111]"
            >
              ← Hallcraft
            </Link>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.45fr] lg:items-end">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#9a9488]">
                  {eyebrow}
                </p>
                <h1 className="mt-4 max-w-[760px] text-[clamp(2.1rem,4.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#111]">
                  {title}
                </h1>
                <p className="mt-4 max-w-[560px] text-[12.5px] leading-6 text-[#6f695e]">
                  {intro}
                </p>
              </div>
              {meta ? (
                <p className="text-[9.5px] uppercase tracking-[0.14em] text-[#9a9488] lg:text-right">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[190px_minmax(0,780px)]">
              <aside className="hidden lg:block">
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#111]">
                  Company
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  {[
                    { label: "About", href: "/about" },
                    { label: "Products", href: "/products" },
                    { label: "Contact", href: "/contact" },
                    { label: "Company Verification", href: "/verify" },
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[11px] text-[#6f695e] transition-colors hover:text-[#111]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </aside>

              <article className="min-w-0 rounded-xl border border-[#e2dccf] bg-[#fdfbf6] p-6 sm:p-9">
                <div className="space-y-8 text-[12px] leading-[1.8] text-[#6f695e]">{children}</div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#111]">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#7d9a68]" />
          {item}
        </li>
      ))}
    </ul>
  );
}
