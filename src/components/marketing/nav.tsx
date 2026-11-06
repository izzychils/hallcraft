"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand";
import { Menu as Dropdown, MenuItem, MenuLabel } from "@/components/ui/menu";
import { useAuth } from "@/features/auth/auth";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/#intelligence", label: "Intelligence" },
  { href: "/#templates", label: "Templates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const SOLUTIONS = [
  "Corporate & awards",
  "Weddings & celebrations",
  "Conferences & summits",
  "Exhibitions & launches",
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="relative z-30 border-b border-[#e2dccf] bg-[#f5f2ec]/90 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.slice(0, 2).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[12.5px] text-[#3c372e] transition-colors hover:text-[#101010]"
            >
              {link.label}
            </a>
          ))}

          <Dropdown
            width={236}
            align="start"
            trigger={
              <button
                type="button"
                className="flex items-center gap-1 text-[12.5px] text-[#3c372e] transition-colors hover:text-[#101010]"
              >
                Solutions
                <ChevronDown className="h-3 w-3" />
              </button>
            }
          >
            <MenuLabel>By occasion</MenuLabel>
            {SOLUTIONS.map((solution) => (
              <MenuItem key={solution}>
                <a href="#templates" className="flex items-center justify-between gap-2">
                  {solution}
                  <ArrowUpRight className="h-3 w-3 text-[#a29a8b]" />
                </a>
              </MenuItem>
            ))}
          </Dropdown>

          {LINKS.slice(2).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[12.5px] text-[#3c372e] transition-colors hover:text-[#101010]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden text-[12.5px] font-medium text-[#2f2b24] transition-colors hover:text-[#101010] sm:block"
          >
            {user ? "Open studio" : "Log in"}
          </Link>
          <Link
            href={user ? "/dashboard?new=1" : "/signup"}
            className="hidden items-center gap-1.5 rounded-[4px] border border-[#191712] px-4 py-2 text-[12.5px] font-medium text-[#191712] transition-colors hover:bg-[#191712] hover:text-[#f7f3e9] sm:inline-flex"
          >
            {user ? "New design" : "Start free"}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded border border-[#ddd6c7] text-[#2f2b24] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-[68px] border-b border-[#ddd6c7] bg-[#f8f4ea] px-5 py-5 shadow-paper lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-[14px] text-[#3c372e] hover:bg-[#ece7db]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-[#e5dfd1] pt-3">
            <Link
              href={user ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border border-[#cfc7b7] px-3 py-2 text-center text-[12.5px] font-medium"
            >
              {user ? "Open studio" : "Log in"}
            </Link>
            <Link
              href={user ? "/dashboard?new=1" : "/signup"}
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md bg-[#111] px-3 py-2 text-center text-[12.5px] font-medium text-[#f7f3e9]"
            >
              {user ? "New design" : "Start free"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
