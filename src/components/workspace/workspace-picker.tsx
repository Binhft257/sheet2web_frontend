"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

type WorkspaceOption = {
  href: string;
  title: string;
  description: string;
  Icon: (props: IconProps) => ReactElement;
};

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

function TableIcon(props: IconProps) {
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
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18M8 10v10M16 10v10" />
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
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
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h11m-3-3 3 3-3 3" />
    </svg>
  );
}

const workspaceOptions: WorkspaceOption[] = [
  {
    href: "/owner/dashboard",
    title: "Không gian Quản trị",
    description:
      "Dành cho việc kết nối, cấu hình và quản lý dữ liệu Google Sheets của bạn. Xây dựng giao diện web mới từ bảng tính.",
    Icon: DatabaseIcon,
  },
  {
    href: "/viewer/accessible-views",
    title: "Chế độ Xem dữ liệu",
    description:
      "Dành cho việc truy cập nhanh, xem và tương tác với các bảng dữ liệu đã được chia sẻ hoặc xuất bản.",
    Icon: TableIcon,
  },
];

export default function WorkspacePicker() {
  return (
    <main className="min-h-screen bg-[#f8f7fb] text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            className="text-base font-black tracking-tight text-blue-900"
            href="/"
          >
            SheetToWeb
          </Link>

          <button
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            type="button"
          >
            <LogoutIcon className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[1240px] flex-col items-center justify-center px-5 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Chào mừng trở lại!
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Vui lòng chọn không gian làm việc để tiếp tục
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {workspaceOptions.map(({ href, title, description, Icon }) => (
              <Link
                className="group flex min-h-[220px] flex-col rounded-lg border border-slate-200 bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                href={href}
                key={href}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Icon className="h-6 w-6" />
                </span>

                <div className="mt-8">
                  <h2 className="text-xl font-black text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-2 min-h-[48px] text-sm font-semibold leading-6 text-slate-500">
                    {description}
                  </p>
                </div>

                <span className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-700 transition-colors group-hover:text-blue-800">
                  Truy cập
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
