"use client";

import AppLink from "@/src/components/app-link";
import { internalPath } from "@/src/lib/app-path";
import { usePathname } from "next/navigation";
import type { ReactElement, SVGProps } from "react";
import { useEffect, useRef } from "react";
import BrandMark from "@/src/components/common/brand-mark";

type IconProps = SVGProps<SVGSVGElement>;

type NavigationItem = {
  href: string;
  label: string;
  Icon: (props: IconProps) => ReactElement;
};

type OwnerSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
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

function CloseIcon(props: IconProps) {
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
      <path d="m18 6-12 12M6 6l12 12" />
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

export default function OwnerSidebar({
  mobileOpen = false,
  onMobileClose,
}: OwnerSidebarProps) {
  const pathname = internalPath(usePathname());
  const mobilePanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const desktop = window.matchMedia("(min-width: 1024px)");
    document.body.style.overflow = "hidden";
    mobilePanelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileClose?.();
      }
      if (event.key !== "Tab") return;
      const controls = mobilePanelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    function handleDesktopChange(event: MediaQueryListEvent) {
      if (event.matches) onMobileClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleDesktopChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleDesktopChange);
      previouslyFocused?.focus();
    };
  }, [mobileOpen, onMobileClose]);

  const renderContent = () => (
    <>
      <div className="flex min-h-20 items-center border-b border-line px-6">
        <AppLink className="ui-brand" href="/" aria-label="Sheet2Web, chọn không gian làm việc" onClick={onMobileClose}>
          <BrandMark />
          <span>Sheet2Web</span>
        </AppLink>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-7" aria-label="Điều hướng quản lý">
        <p className="mb-4 px-3.5 text-xs text-muted">Không gian quản lý</p>
        <ul className="space-y-1.5">
          {navigationItems.map(({ href, label, Icon }) => {
            const active = isActiveRoute(pathname, href);
            return (
              <li key={href}>
                <AppLink
                  className="ui-nav-link"
                  aria-current={active ? "page" : undefined}
                  href={href}
                  onClick={onMobileClose}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </AppLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <AppLink
          className="ui-button w-full"
          data-variant="outlined"
          aria-label="Đổi không gian làm việc"
          href="/"
          onClick={onMobileClose}
        >
          <WorkspaceSwitchIcon className="h-5 w-5" />
          Đổi không gian
        </AppLink>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-dvh w-64 flex-col border-r border-line bg-surface lg:flex">
        {renderContent()}
      </aside>

      {mobileOpen ? (
        <div className="ui-mobile-overlay lg:hidden">
          <button
            aria-label="Đóng menu"
            className="ui-mobile-backdrop"
            onClick={onMobileClose}
            type="button"
          />
          <aside className="ui-mobile-panel" id="owner-mobile-navigation" role="dialog" aria-modal="true" aria-label="Menu quản lý" ref={mobilePanelRef}>
            <button
              aria-label="Đóng menu"
              className="ui-icon-button absolute right-3 top-[18px]"
              onClick={onMobileClose}
              type="button"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            {renderContent()}
          </aside>
        </div>
      ) : null}
    </>
  );
}
