"use client";

import AppLink from "@/src/components/app-link";
import BrandMark from "@/src/components/common/brand-mark";
import {
  CloseIcon,
  DashboardIcon,
  TableIcon,
  WorkspaceSwitchIcon,
} from "@/src/components/common/icons";
import { internalPath } from "@/src/lib/app-path";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./viewer-navigation.module.css";

type ViewerSidebarProps = { mobileOpen: boolean; onMobileClose: () => void };

const navigationItems = [
  { href: "/viewer/dashboard", label: "Tổng quan", Icon: DashboardIcon },
  { href: "/viewer/shared", label: "Được chia sẻ với tôi", Icon: TableIcon },
];

function NavigationContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className={styles.brand}>
        <AppLink
          className="ui-brand"
          href="/"
          aria-label="Sheet2Web, chọn không gian làm việc"
          onClick={onNavigate}
        >
          <BrandMark />
          <span>Sheet2Web</span>
        </AppLink>
      </div>
      <nav className={styles.navigation} aria-label="Điều hướng người xem">
        <p>Không gian người xem</p>
        <ul>
          {navigationItems.map(({ href, label, Icon }) => (
            <li key={href}>
              <AppLink
                className="ui-nav-link"
                aria-current={
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "page"
                    : undefined
                }
                href={href}
                onClick={onNavigate}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </AppLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.footer}>
        <AppLink
          className="ui-button w-full"
          data-variant="outlined"
          href="/"
          aria-label="Đổi không gian làm việc"
          onClick={onNavigate}
        >
          <WorkspaceSwitchIcon />
          Đổi không gian
        </AppLink>
      </div>
    </>
  );
}

export default function ViewerSidebar({
  mobileOpen,
  onMobileClose,
}: ViewerSidebarProps) {
  const pathname = internalPath(usePathname());
  const mobileDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!mobileOpen || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) onMobileClose();
    };
    document.body.style.overflow = "hidden";
    dialog.showModal();
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <aside className={styles.desktop}>
        <NavigationContent pathname={pathname} onNavigate={onMobileClose} />
      </aside>
      <dialog
        className={styles.mobilePanel}
        ref={mobileDialogRef}
        id="viewer-mobile-navigation"
        aria-label="Menu người xem"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled])",
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          onMobileClose();
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            onMobileClose();
        }}
      >
        <button
          className={`ui-icon-button ${styles.closeButton}`}
          aria-label="Đóng menu"
          type="button"
          onClick={onMobileClose}
        >
          <CloseIcon />
        </button>
        <NavigationContent pathname={pathname} onNavigate={onMobileClose} />
      </dialog>
    </>
  );
}
