"use client";

import DashboardStats from "@/src/components/owner/dashboard/dashboard-stats";
import SourceStatusTable from "@/src/components/owner/dashboard/source-status-table";
import { useDataSources } from "@/src/hooks/owner/use-data-sources";
import { useViews } from "@/src/hooks/owner/use-views";
import AppLink from "@/src/components/app-link";
import PageHeader from "@/src/components/common/page-header";
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
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
      <PageHeader
        title="Tổng quan"
        description="Theo dõi nguồn dữ liệu và các view trong không gian làm việc của bạn."
        actions={
          <>
          <span className="ui-update-status" role="status">
            <span
              className={`ui-status-dot ${isRefreshing ? "animate-pulse" : ""}`}
              aria-hidden="true"
            />
            {isRefreshing ? "Đang cập nhật..." : "Đã cập nhật"}
          </span>
          <AppLink
            className="ui-button"
            href="/owner/views/new"
          >
            <PlusIcon className="h-5 w-5" />
            Tạo view mới
          </AppLink>
          </>
        }
      />

      {allErrors.length > 0 ? (
        <div className="space-y-2" role="alert">
          {allErrors.map((message) => (
            <p
              className="ui-alert"
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
