"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

type NavigationItem = {
  href: string;
  label: string;
  Icon: (props: IconProps) => ReactElement;
};

function DashboardIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="8" rx="1.5" width="8" x="3" y="3" />
      <rect height="8" rx="1.5" width="8" x="13" y="3" />
      <rect height="8" rx="1.5" width="8" x="3" y="13" />
      <rect height="8" rx="1.5" width="8" x="13" y="13" />
    </svg>
  );
}

function SharedViewIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3 10h18" />
      <path d="M8 5v14" />
      <path d="M15 14h3" />
    </svg>
  );
}

function TableIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18M8 10v10M16 10v10" />
    </svg>
  );
}

function WorkspaceSwitchIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M7 7h11m-3-3 3 3-3 3" />
      <path d="M17 17H6m3-3-3 3 3 3" />
    </svg>
  );
}

const navigationItems: NavigationItem[] = [
  {
    href: "/viewer/dashboard",
    label: "Tổng quan",
    Icon: DashboardIcon,
  },
  {
    href: "/viewer/shared",
    label: "Được chia sẻ với tôi",
    Icon: SharedViewIcon,
  },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ViewerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-white shadow-[1px_0_3px_rgba(15,23,42,0.04)] lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-700 text-white shadow-[0_8px_18px_rgba(30,58,138,0.2)]">
            <TableIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black tracking-tight text-blue-900">
              Sheet2Web
            </p>
            <p className="truncate text-sm font-medium text-slate-500">
              Workspace người xem
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5">
        <ul className="space-y-2">
          {navigationItems.map(({ href, label, Icon }) => {
            const active = isActiveRoute(pathname, href);
            return (
              <li key={href}>
                <Link
                  className={`relative flex h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-900"
                  }`}
                  href={href}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{label}</span>
                  {active ? (
                    <span className="absolute right-0 top-2.5 h-7 w-1 rounded-l-full bg-blue-700" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <Link
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          href="/"
        >
          <WorkspaceSwitchIcon className="h-5 w-5" />
          Đổi workspace
        </Link>
      </div>
    </aside>
  );
}
