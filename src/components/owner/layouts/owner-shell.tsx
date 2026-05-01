import OwnerSidebar from "@/src/components/owner/layouts/owner-sidebar";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

type OwnerShellProps = {
  children: ReactNode;
};

function HelpIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.7 9.5a2.5 2.5 0 0 1 4.8.8c0 1.8-2.5 2.1-2.5 3.7" />
      <path d="M12 17.5v.01" />
    </svg>
  );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M15 18H9m10 0a2 2 0 0 1-2-2v-4.5a5 5 0 0 0-10 0V16a2 2 0 0 1-2 2h14Z" />
      <path d="M13.7 18a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 14.3a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1A2 2 0 0 1 4 16.2l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H2.7a2 2 0 0 1 0-4H3a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8L4 6.4a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 .9-1.5V2.3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5.9h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" />
    </svg>
  );
}

export default function OwnerShell({ children }: OwnerShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f7fb] text-slate-900">
      <OwnerSidebar />

      <div className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6">
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900">
              Workspace Quản trị
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              type="button"
            >
              <BellIcon className="h-5 w-5" />
            </button>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              type="button"
            >
              <HelpIcon className="h-5 w-5" />
            </button>
            <Link
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              href="/owner/settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800 ring-2 ring-white">
              S2
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
