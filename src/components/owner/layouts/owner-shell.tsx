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
    <div className="min-h-screen bg-[#f8f7fb] text-slate-900">
      <OwnerSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-64">
        <WorkspaceTopbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          title="Workspace Quản trị"
        />

        <main className="px-4 py-5 sm:px-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
