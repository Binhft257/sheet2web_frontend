"use client";

import OwnerSidebar from "@/src/components/owner/layouts/owner-sidebar";
import WorkspaceTopbar from "@/src/components/workspace/workspace-topbar";
import type { ReactNode } from "react";
import { useState } from "react";

type OwnerShellProps = {
  children: ReactNode;
};

export default function OwnerShell({ children }: OwnerShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a className="ui-skip-link" href="#owner-content">Đến nội dung chính</a>
      <OwnerSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-64">
        <WorkspaceTopbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          menuOpen={mobileSidebarOpen}
          menuId="owner-mobile-navigation"
          title="Không gian quản lý"
        />

        <main className="px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-10 xl:px-12" id="owner-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
