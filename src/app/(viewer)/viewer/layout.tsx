import ViewerWorkspaceShell from "@/src/components/viewer/workspace/viewer-workspace-shell";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <ViewerWorkspaceShell>{children}</ViewerWorkspaceShell>;
}
