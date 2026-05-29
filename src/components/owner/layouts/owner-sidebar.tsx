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

function DatabaseIcon(props: IconProps) {
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
      <ellipse cx="12" cy="5" rx="8.5" ry="3.5" />
      <path d="M3.5 5v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5V5" />
      <path d="M3.5 11v6c0 1.9 3.8 3.5 8.5 3.5s8.5-1.6 8.5-3.5v-6" />
    </svg>
  );
}

function ViewIcon(props: IconProps) {
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
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20" />
      <path d="M8 5v14" />
    </svg>
  );
}

function CreateViewIcon(props: IconProps) {
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
      <path d="M3 10h18M12 14v4M10 16h4" />
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
    href: "/owner/dashboard",
    label: "Tổng quan",
    Icon: DashboardIcon,
  },
  {
    href: "/owner/data-sources",
    label: "Nguồn dữ liệu",
    Icon: DatabaseIcon,
  },
  {
    href: "/owner/views/new",
    label: "Tạo view",
    Icon: CreateViewIcon,
  },
  {
    href: "/owner/views",
    label: "Quản lý view",
    Icon: ViewIcon,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/owner/views") {
    return (
      pathname === href ||
      (pathname.startsWith(`${href}/`) &&
        !pathname.startsWith("/owner/views/new"))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-white shadow-[1px_0_3px_rgba(15,23,42,0.04)] lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-700 text-white shadow-[0_8px_18px_rgba(30,58,138,0.2)]">
            <DatabaseIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-black tracking-tight text-blue-900">
              Sheet2Web
            </p>
            <p className="truncate text-sm font-medium text-slate-500">
              Quản trị hệ thống
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
