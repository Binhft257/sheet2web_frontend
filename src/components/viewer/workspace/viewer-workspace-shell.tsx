import ViewerSidebar from "@/src/components/viewer/workspace/viewer-sidebar";
import WorkspaceTopbar from "@/src/components/workspace/workspace-topbar";
import type { ReactNode } from "react";

type ViewerWorkspaceShellProps = {
  children: ReactNode;
};

export default function ViewerWorkspaceShell({
  children,
}: ViewerWorkspaceShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f7fb] text-slate-900">
      <ViewerSidebar />

      <div className="min-h-screen lg:ml-64">
        <WorkspaceTopbar title="Workspace người xem" />

        <main className="px-4 py-5 sm:px-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
