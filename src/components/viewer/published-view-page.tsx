"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import ViewerShell from "@/src/components/layouts/viewer-shell";
import SharedViewRender, {
  type ReloadMode,
} from "@/src/components/viewer/shared-view-render";
import { usePublishedView } from "@/src/hooks/viewer/use-published-view";
import { ViewBySlugError } from "@/src/services/view.service";
import type { ThemePreset, ViewJsonObject } from "@/src/types/view";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PublishedViewPageProps = {
  slug: string;
  shareToken?: string;
};

const MIN_REFRESH_INTERVAL_SECONDS = 10;
const DEFAULT_INTERVAL_SECONDS = 10;
const INTERVAL_OPTIONS_SECONDS = [10, 30, 60, 120];

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

function getStorageKeys(slug: string) {
  return {
    mode: `sheet2web:view:${slug}:reload-mode`,
    interval: `sheet2web:view:${slug}:reload-interval`,
  };
}

export default function PublishedViewPage({
  slug,
  shareToken,
}: PublishedViewPageProps) {
  const publishedViewQuery = usePublishedView(slug, shareToken);
  const { refetch } = publishedViewQuery;
  const [selectedTheme, setSelectedTheme] = useState<ThemePreset | null>(null);
  const [reloadMode, setReloadMode] = useState<ReloadMode>("manual");
  const [reloadIntervalSeconds, setReloadIntervalSeconds] = useState(
    DEFAULT_INTERVAL_SECONDS,
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const keys = getStorageKeys(slug);
    const storedMode = window.localStorage.getItem(keys.mode);
    const storedInterval = Number(window.localStorage.getItem(keys.interval));

    if (storedMode === "manual" || storedMode === "auto") {
      setReloadMode(storedMode);
    }

    if (
      Number.isFinite(storedInterval) &&
      storedInterval >= MIN_REFRESH_INTERVAL_SECONDS
    ) {
      setReloadIntervalSeconds(storedInterval);
    }
  }, [slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const keys = getStorageKeys(slug);
    window.localStorage.setItem(keys.mode, reloadMode);
  }, [reloadMode, slug]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const keys = getStorageKeys(slug);
    window.localStorage.setItem(keys.interval, String(reloadIntervalSeconds));
  }, [reloadIntervalSeconds, slug]);

  const safeInterval = useMemo(
    () => Math.max(MIN_REFRESH_INTERVAL_SECONDS, reloadIntervalSeconds),
    [reloadIntervalSeconds],
  );

  useEffect(() => {
    if (reloadMode !== "auto") {
      setRemainingSeconds(null);
      return;
    }

    setRemainingSeconds(safeInterval);

    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        const nextValue = (previous ?? safeInterval) - 1;

        if (nextValue <= 0) {
          void refetch();
          return safeInterval;
        }

        return nextValue;
      });
    }, 1_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [refetch, reloadMode, safeInterval]);

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

  return (
    <ViewerShell>
      <SharedViewRender
        allowThemeSwitch={view.allowThemeSwitch}
        emptyTitle="Chưa có dữ liệu để hiển thị"
        headers={snapshot?.headers ?? []}
        intervalOptionsSeconds={INTERVAL_OPTIONS_SECONDS}
        intervalSeconds={safeInterval}
        isReloading={publishedViewQuery.isFetching}
        onIntervalSecondsChange={(seconds) =>
          setReloadIntervalSeconds(
            Math.max(MIN_REFRESH_INTERVAL_SECONDS, Number(seconds) || 10),
          )
        }
        onReload={() => {
          void refetch();
        }}
        onReloadModeChange={setReloadMode}
        onThemeChange={setSelectedTheme}
        reloadMode={reloadMode}
        remainingSeconds={remainingSeconds}
        rowCount={snapshot?.rowCount ?? 0}
        rows={snapshot?.rows ?? []}
        themePreset={activeTheme}
        title={view.name}
        updatedAtLabel={formatDateTime(snapshot?.fetchedAt ?? view.lastPublishedAt)}
      />
    </ViewerShell>
  );
}
