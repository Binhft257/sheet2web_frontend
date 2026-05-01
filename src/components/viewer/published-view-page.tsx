"use client";

import ViewerShell from "@/src/components/layouts/viewer-shell";
import ViewerTable from "@/src/components/viewer/viewer-table";
import { usePublishedView } from "@/src/hooks/viewer/use-published-view";
import { ViewBySlugError } from "@/src/services/view.service";
import type { ThemePreset, ViewJsonObject } from "@/src/types/view";
import Link from "next/link";
import { useState } from "react";

type PublishedViewPageProps = {
  slug: string;
  shareToken?: string;
};

const themeOptions: Array<{
  value: ThemePreset;
  label: string;
}> = [
  {
    value: "modern",
    label: "Modern",
  },
  {
    value: "classic",
    label: "Classic",
  },
  {
    value: "minimal",
    label: "Minimal",
  },
];

function isThemePreset(value: unknown): value is ThemePreset {
  return value === "modern" || value === "classic" || value === "minimal";
}

function getThemePreset(themeOverrideJson: ViewJsonObject | null | undefined) {
  const preset = themeOverrideJson?.preset;
  return isThemePreset(preset) ? preset : "modern";
}

function getErrorStatus(error: unknown) {
  if (error instanceof ViewBySlugError) {
    return error.status;
  }

  return undefined;
}

function formatDateTime(dateTime: string | null | undefined) {
  if (!dateTime) {
    return "--";
  }

  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function LoadingState() {
  return (
    <ViewerShell>
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="h-9 w-72 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-100" />
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div
              className="grid grid-cols-4 gap-5 border-b border-slate-100 px-5 py-4 last:border-b-0"
              key={`viewer-loading-${rowIndex}`}
            >
              {Array.from({ length: 4 }).map((__, cellIndex) => (
                <div
                  className="h-5 animate-pulse rounded bg-slate-100"
                  key={`viewer-loading-${rowIndex}-${cellIndex}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </ViewerShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xl font-bold text-slate-900">
        Chưa có dữ liệu để hiển thị
      </p>
    </div>
  );
}

function ErrorState({ status }: { status?: number }) {
  const title =
    status === 403
      ? "Bạn không có quyền xem view này"
      : status === 404
        ? "View không tồn tại hoặc chưa được xuất bản"
        : "Không thể tải view. Vui lòng thử lại sau.";

  return (
    <ViewerShell>
      <div className="mx-auto mt-20 max-w-xl rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
        <p className="text-2xl font-bold text-slate-900">{title}</p>
        {status === 403 ? (
          <Link
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-6 text-base font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
            href="/sign-in"
          >
            Đăng nhập
          </Link>
        ) : null}
      </div>
    </ViewerShell>
  );
}

export default function PublishedViewPage({
  slug,
  shareToken,
}: PublishedViewPageProps) {
  const publishedViewQuery = usePublishedView(slug, shareToken);
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);

  if (publishedViewQuery.isPending) {
    return <LoadingState />;
  }

  if (publishedViewQuery.isError) {
    return <ErrorState status={getErrorStatus(publishedViewQuery.error)} />;
  }

  const { view, snapshot } = publishedViewQuery.data;
  const ownerTheme = getThemePreset(view.themeOverrideJson);
  const activeTheme = view.allowThemeSwitch
    ? selectedTheme ?? ownerTheme
    : ownerTheme;
  const hasRows = Boolean(snapshot?.rows.length);

  return (
    <ViewerShell>
      <div className="space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold text-slate-900">
                {view.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                <span>{snapshot?.rowCount ?? 0} dòng</span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>
                  Cập nhật {formatDateTime(snapshot?.fetchedAt ?? view.lastPublishedAt)}
                </span>
              </div>
            </div>

            {view.allowThemeSwitch ? (
              <div className="flex shrink-0 rounded-md border border-slate-200 bg-slate-50 p-1">
                {themeOptions.map((theme) => {
                  const active = theme.value === activeTheme;

                  return (
                    <button
                      className={`h-9 rounded px-3 text-sm font-bold transition-colors ${
                        active
                          ? "bg-white text-blue-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      key={theme.value}
                      onClick={() => setSelectedTheme(theme.value)}
                      type="button"
                    >
                      {theme.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </header>

        {!snapshot || !hasRows ? (
          <EmptyState />
        ) : (
          <ViewerTable
            headers={snapshot.headers}
            rows={snapshot.rows}
            themePreset={activeTheme}
          />
        )}
      </div>
    </ViewerShell>
  );
}
