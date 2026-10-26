"use client";

import ViewerSidebar from "@/src/components/viewer/workspace/viewer-sidebar";
import WorkspaceTopbar from "@/src/components/workspace/workspace-topbar";
import { useCallback, useState, type ReactNode } from "react";

type ViewerWorkspaceShellProps = {
  children: ReactNode;
};

export default function ViewerWorkspaceShell({
  children,
}: ViewerWorkspaceShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a className="ui-skip-link" href="#viewer-content">
        Đến nội dung chính
      </a>
      <ViewerSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />

      <div className="min-h-screen lg:ml-64">
        <WorkspaceTopbar
          title="Không gian người xem"
          onMenuClick={() => setMobileSidebarOpen(true)}
          menuOpen={mobileSidebarOpen}
          menuId="viewer-mobile-navigation"
        />

        <main
          className="px-5 py-8 outline-none sm:px-8 sm:py-10 lg:px-10 xl:px-12"
          id="viewer-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
