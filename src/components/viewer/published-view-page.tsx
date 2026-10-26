"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import ViewerShell from "@/src/components/layouts/viewer-shell";
import SharedViewRender, {
  type ReloadMode,
} from "@/src/components/viewer/shared-view-render";
import { usePublishedView } from "@/src/hooks/viewer/use-published-view";
import { ViewBySlugError } from "@/src/services/view.service";
import type { ThemePreset, ViewJsonObject } from "@/src/types/view";
import AppLink from "@/src/components/app-link";
import { WarningIcon } from "@/src/components/common/icons";
import { useEffect, useMemo, useState } from "react";
import styles from "./published-view.module.css";

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
      <div
        className={styles.view}
        role="status"
        aria-label="Đang tải view"
        aria-busy="true"
      >
        <div className={styles.loadingHeader} aria-hidden="true">
          <span className={`ui-skeleton ${styles.loadingTitle}`} />
          <span className={`ui-skeleton ${styles.loadingInfo}`} />
        </div>
        <div className={styles.loadingTable} aria-hidden="true">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div
              className={styles.loadingRow}
              key={`viewer-loading-${rowIndex}`}
            >
              {Array.from({ length: 4 }).map((__, cellIndex) => (
                <div
                  className="ui-skeleton h-5"
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
      <div className={styles.error} role="alert">
        <span className={styles.stateIcon}>
          <WarningIcon />
        </span>
        <h1>{title}</h1>
        {status === 403 ? (
          <AppLink className="ui-button mt-6" href="/sign-in">
            Đăng nhập
          </AppLink>
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
