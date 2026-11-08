import Link from "next/link";
import { Logo } from "@/components/brand";
import { site } from "@/lib/site";

const GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Everything included", href: "/products" },
      { label: "Studio", href: "/dashboard" },
      { label: "Templates", href: "/dashboard/templates" },
      { label: "Item library", href: "/dashboard/library" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Products", href: "/products" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Occasions",
    links: [
      { label: "Awards nights", href: "/dashboard/templates" },
      { label: "Weddings", href: "/dashboard/templates" },
      { label: "Galas", href: "/dashboard/templates" },
      { label: "Conferences", href: "/dashboard/templates" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      // { label: "Company Verification", href: "/verify" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#ddd6c8] bg-[#f8f4ea]">
      <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[11.5px] leading-5 text-[#7c7568]">
              Event space design, planned to the centimetre. Draw it, seat it, check it, share
              it.
            </p>
            {/* <p className="mt-4 text-[10.5px] font-semibold text-[#111]">{site.companyLine}</p> */}
            <p className="mt-2 text-[10.5px] leading-5 text-[#8a8376]">
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-[#111]"
              >
                {site.email}
              </a>
              <br />
              {site.location}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-[#7d9a68]" />
              <span className="text-[10px] text-[#8a8376]">
                Frontend preview · local data only
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#9a9488]">
                  {group.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[11px] text-[#6f695e] transition-colors hover:text-[#111]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5dfd1] pt-4 text-[10px] text-[#9a9488]">
          <p>
            © {new Date().getFullYear()} {site.company}. {/* {site.name} is a product of {site.company}. */}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/privacy" className="transition-colors hover:text-[#111]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#111]">
              Terms
            </Link>
            <span className="h-3 w-px bg-[#d9d2c4]" />
            <p className="flex items-center gap-2">
              Designed for rooms that only happen once.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
