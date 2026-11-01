"use client";

import AppLink from "@/src/components/app-link";
import { internalPath } from "@/src/lib/app-path";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

const navigationItems = [
  { href: "/admin/dashboard", label: "Tổng quan" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/views", label: "View" },
  { href: "/admin/settings", label: "Cài đặt" },
];

export default function AdminSidebar() {
  const pathname = internalPath(usePathname());
  return (
    <aside className={styles.navigation}>
      <nav aria-label="Điều hướng quản trị">
        <ul>
          {navigationItems.map(({ href, label }) => (
            <li key={href}>
              <AppLink
                className="ui-nav-link"
                href={href}
                aria-current={
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "page"
                    : undefined
                }
              >
                {label}
              </AppLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
