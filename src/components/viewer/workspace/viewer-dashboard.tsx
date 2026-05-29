"use client";

import {
  AccessBadge,
  ExternalIcon,
  getErrorMessage,
  getUpdatedOrSharedLabel,
  getViewUrl,
} from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import { useViewerDashboard } from "@/src/hooks/viewer/use-viewer-workspace";
import type { ViewerSharedView } from "@/src/types/viewer";
import { useRouter } from "next/navigation";
import type { SVGProps } from "react";

function SharedIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3 10h18" />
      <path d="M8 5v14" />
    </svg>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      <div className="h-20 animate-pulse rounded-lg bg-white" />
      <div className="h-36 animate-pulse rounded-lg bg-white" />
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white"
            key={`viewer-dashboard-loading-${index}`}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-lg font-bold text-slate-900">
        Bạn chưa được chia sẻ view nào.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-500">
        Khi owner cấp quyền truy cập, các view mới sẽ xuất hiện tại đây.
      </p>
    </section>
  );
}

function RecentViewItem({
  view,
  onOpen,
}: {
  view: ViewerSharedView;
  onOpen: (view: ViewerSharedView) => void;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="line-clamp-1 text-base font-bold text-slate-900">
              {view.name}
            </h3>
            <AccessBadge accessMode={view.accessMode} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
            <span>{view.owner.fullName || view.owner.email}</span>
            {view.snapshot ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>{view.snapshot.rowCount} dòng</span>
              </>
            ) : null}
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <span>{getUpdatedOrSharedLabel(view)}</span>
          </div>
        </div>

        <button
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
          onClick={() => onOpen(view)}
          type="button"
        >
          <ExternalIcon className="h-4 w-4" />
          Xem View
        </button>
      </div>
    </li>
  );
}

export default function ViewerDashboard() {
  const router = useRouter();
  const dashboardQuery = useViewerDashboard();

  if (dashboardQuery.isPending) {
    return <LoadingState />;
  }

  const errorMessage = dashboardQuery.isError
    ? getErrorMessage(
        dashboardQuery.error,
        "Không thể tải tổng quan người xem.",
      )
    : null;

  if (errorMessage) {
    return (
      <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-base font-bold text-red-700">{errorMessage}</p>
          <button
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
            onClick={() => dashboardQuery.refetch()}
            type="button"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  const dashboard = dashboardQuery.data;
  if (!dashboard) {
    return (
      <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
          <p className="text-base font-bold text-red-700">
            Không thể tải tổng quan người xem.
          </p>
          <button
            className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-red-200 bg-white px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
            onClick={() => dashboardQuery.refetch()}
            type="button"
          >
            Thử lại
          </button>
        </div>
      </section>
    );
  }

  const recentViews = dashboard.recentSharedViews.slice(0, 5);
  const isEmpty = dashboard.totalSharedViews === 0 || recentViews.length === 0;

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Tổng quan người xem
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Theo dõi các view đã được chia sẻ cho bạn
          </p>
        </div>

        <button
          className="inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)] transition-colors hover:border-blue-800 hover:bg-blue-800"
          onClick={() => router.push("/viewer/shared")}
          type="button"
        >
          Xem tất cả
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">
                View đã chia sẻ
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900">
                {dashboard.totalSharedViews}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <SharedIcon className="h-6 w-6" />
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              View mới được chia sẻ
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Tối đa 5 view gần nhất bạn được cấp quyền truy cập
            </p>
          </div>
        </div>

        {isEmpty ? (
          <EmptyState />
        ) : (
          <ul className="space-y-3">
            {recentViews.map((view) => (
              <RecentViewItem
                key={view.id}
                onOpen={(item) => router.push(getViewUrl(item))}
                view={view}
              />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
