"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FolderOpen,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LogOut,
  Menu as MenuIcon,
  Settings,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import { Avatar } from "@/components/ui/primitives";
import { signOut, useAuth } from "@/features/auth/auth";
import { useDesigns } from "@/features/designs/library";
import { NewDesignButton } from "@/features/designs/new-design";
import { getSceneWarnings } from "@/features/floorplan/geometry";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/designs", label: "Designs", icon: FolderOpen },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutGrid },
  { href: "/dashboard/library", label: "Item library", icon: Library },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  pathname,
  onNavigate,
  issueCount,
  designCount,
}: {
  pathname: string;
  onNavigate?: () => void;
  issueCount: number;
  designCount: number;
}) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between px-5">
        <Logo />
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            className="grid h-8 w-8 place-items-center rounded-md text-[#6f695e] hover:bg-[#ece7db]"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="px-3">
        <NewDesignButton className="w-full justify-start" size="sm" />
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 no-scrollbar">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b9487]">
          Studio
        </p>
        <ul className="space-y-0.5">
          {NAV.slice(0, 5).map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors",
                    active
                      ? "bg-[#eae4d7] font-medium text-[#171510]"
                      : "text-[#5f594e] hover:bg-[#efeade] hover:text-[#171510]",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[16px] w-[16px] shrink-0",
                      active ? "text-[#171510]" : "text-[#8a8376] group-hover:text-[#4d473c]",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.href === "/dashboard/designs" && designCount > 0 ? (
                    <span className="text-[10px] tabular-nums text-[#9a9488]">{designCount}</span>
                  ) : null}
                  {item.href === "/dashboard/designs" && issueCount > 0 ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c2603f]" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b9487]">
          Studio tools
        </p>
        <Link
          href="/dashboard/designs"
          onClick={onNavigate}
          className="block rounded-xl border border-[#ded7c8] bg-[#f8f4ea] p-3 transition-colors hover:border-[#c9c1b1] hover:bg-[#f4eee2]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#3b372f]">Venue checks</span>
            <TriangleAlert
              className={cn("h-3.5 w-3.5", issueCount > 0 ? "text-[#b25439]" : "text-[#7c8a6b]")}
            />
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#7c7568]">
            {issueCount > 0
              ? `${issueCount} open recommendation${issueCount === 1 ? "" : "s"} across your designs.`
              : "Every saved design passes the basic checks."}
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#3b372f]">
            Review rooms <ArrowUpRight className="h-3 w-3" />
          </span>
        </Link>

        <div className="mt-4 rounded-xl bg-[#111111] p-3 text-[#f7f3e9]">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#c9c4b7]">
            <Sparkles className="h-3 w-3 text-[#d9f36b]" />
            Studio plan
          </span>
          <p className="mt-1.5 text-[12px] font-medium">{designCount} of 25 designs</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#d9f36b]"
              style={{ width: `${Math.min(100, (designCount / 25) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] leading-4 text-[#a8a294]">
            Frontend preview: all data is stored in this browser.
          </p>
        </div>
      </nav>

      <div className="border-t border-[#e2dccf] p-3">
        <Menu
          width={230}
          trigger={
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-[#ece7db]"
            >
              <Avatar name={user?.name ?? "Guest"} color="#7c5cff" size="md" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium">
                  {user?.name ?? "Your studio"}
                </span>
                <span className="block truncate text-[10.5px] text-[#8a8376]">
                  {user?.studio ?? "Sign in"}
                </span>
              </span>
              <svg
                viewBox="0 0 12 12"
                className="h-3 w-3 shrink-0 text-[#8a8376]"
                aria-hidden="true"
              >
                <path
                  d="M3 4.5 6 7.5l3-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          }
        >
          <div className="px-2.5 py-2">
            <p className="text-[12px] font-medium">{user?.name}</p>
            <p className="truncate text-[11px] text-[#8a8376]">{user?.email}</p>
          </div>
          <MenuSeparator />
          <MenuItem onClick={() => router.push("/dashboard/settings")}>Studio settings</MenuItem>
          <MenuItem onClick={() => router.push("/dashboard/team")}>Invite your team</MenuItem>
          <MenuSeparator />
          <MenuItem
            destructive
            onClick={() => {
              signOut();
              router.push("/");
            }}
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </span>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const designs = useDesigns();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, ready, router, user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const issueCount = useMemo(
    () =>
      designs.reduce(
        (total, design) =>
          total +
          getSceneWarnings(design.scene).filter(
            (warning) => warning.severity === "high" || warning.severity === "medium",
          ).length,
        0,
      ),
    [designs],
  );

  if (!ready || !user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f5f2ec]">
        <div className="flex flex-col items-center gap-4">
          <LogoMark className="h-11 w-11 animate-pulse-soft" />
          <p className="text-[12px] tracking-wide text-[#8a8376]">Opening your studio…</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f5f2ec]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-[#e0d9cb] bg-[#f8f4eb] lg:block">
        <SidebarContent
          pathname={pathname}
          issueCount={issueCount}
          designCount={designs.length}
        />
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e0d9cb] bg-[#f8f4eb]/95 px-4 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1.5">
          <NewDesignButton size="sm" label="New" />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-[#15130f]/40 backdrop-blur-[2px] animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] border-r border-[#e0d9cb] bg-[#f8f4eb] shadow-lift animate-[slide-in-left_0.25s_cubic-bezier(0.16,1,0.3,1)]">
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              issueCount={issueCount}
              designCount={designs.length}
            />
          </aside>
        </div>
      ) : null}

      <main className="lg:pl-[248px]">{children}</main>
    </div>
  );
}
