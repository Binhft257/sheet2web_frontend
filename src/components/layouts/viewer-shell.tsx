import type { ReactNode } from "react";

type ViewerShellProps = {
  children: ReactNode;
};

export default function ViewerShell({ children }: ViewerShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f7fb] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full">{children}</div>
    </main>
  );
}
