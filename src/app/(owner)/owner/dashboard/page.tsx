"use client";

import DashboardStats from "@/src/components/owner/dashboard/dashboard-stats";
import SourceStatusTable from "@/src/components/owner/dashboard/source-status-table";
import { useDataSources } from "@/src/hooks/owner/use-data-sources";
import { useViews } from "@/src/hooks/owner/use-views";
import Link from "next/link";
import type { SVGProps } from "react";

const DASHBOARD_PAGE = 1;
const DASHBOARD_LIMIT = 20;

function PlusIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export default function OwnerDashboardPage() {
  const dataSourcesQuery = useDataSources({
    page: DASHBOARD_PAGE,
    limit: DASHBOARD_LIMIT,
  });
  const viewsQuery = useViews({
    page: DASHBOARD_PAGE,
    limit: DASHBOARD_LIMIT,
  });

  const totalDataSources = dataSourcesQuery.data?.meta.total ?? 0;
  const totalViews = viewsQuery.data?.meta.total ?? 0;
  const publicViews =
    viewsQuery.data?.items.filter(
      (view) => view.accessMode.trim().toLowerCase() === "public",
    )
      .length ?? 0;
  const privateViews =
    viewsQuery.data?.items.filter(
      (view) => view.accessMode.trim().toLowerCase() === "private",
    )
      .length ?? 0;

  const cardLoading = dataSourcesQuery.isPending || viewsQuery.isPending;
  const isRefreshing = dataSourcesQuery.isFetching || viewsQuery.isFetching;
  const dataSources = dataSourcesQuery.data?.items ?? [];

  const dataSourcesError = dataSourcesQuery.isError
    ? getErrorMessage(
        dataSourcesQuery.error,
        "Không thể tải dữ liệu nguồn.",
      )
    : null;

  const viewsError = viewsQuery.isError
    ? getErrorMessage(viewsQuery.error, "Không thể tải dữ liệu view.")
    : null;

  const allErrors = Array.from(
    new Set([dataSourcesError, viewsError].filter(Boolean)),
  ) as string[];

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Tổng quan
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Hiệu suất và trạng thái của các dữ liệu hiện tại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRefreshing ? "animate-pulse bg-blue-700" : "bg-emerald-500"
              }`}
            />
            {isRefreshing ? "Đang cập nhật..." : "Đã cập nhật"}
          </span>
          <Link
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)] transition-colors hover:border-blue-800 hover:bg-blue-800"
            href="/owner/views/new"
          >
            <PlusIcon className="h-5 w-5" />
            Tạo View Mới
          </Link>
        </div>
      </header>

      {allErrors.length > 0 ? (
        <div className="space-y-2">
          {allErrors.map((message) => (
            <p
              className="rounded-lg border border-brown-200 bg-brown-50 px-5 py-4 text-sm text-brown-700"
              key={message}
            >
              {message}
            </p>
          ))}
        </div>
      ) : null}

      <DashboardStats
        isLoading={cardLoading}
        privateViews={privateViews}
        publicViews={publicViews}
        totalDataSources={totalDataSources}
        totalViews={totalViews}
      />

      <SourceStatusTable
        dataSources={dataSources}
        errorMessage={dataSourcesError}
        isLoading={dataSourcesQuery.isPending}
      />
    </section>
  );
}
