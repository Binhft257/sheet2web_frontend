import { SharedButton } from "@/src/components/share";
import { TableIcon } from "@/src/components/common/icons";
import type { ReactNode } from "react";
import ViewerTable from "@/src/components/viewer/viewer-table";
import type { ThemePreset } from "@/src/types/view";
import styles from "./published-view.module.css";

export type ReloadMode = "manual" | "auto";

type SharedViewRenderProps = {
  headingLevel?: "h1" | "h2";
  title: string;
  rowCount: number;
  updatedAtLabel: string;
  headers: string[];
  rows: string[][];
  themePreset: ThemePreset;
  allowThemeSwitch?: boolean;
  onThemeChange?: (theme: ThemePreset) => void;
  reloadMode: ReloadMode;
  onReloadModeChange: (mode: ReloadMode) => void;
  intervalSeconds: number;
  onIntervalSecondsChange: (seconds: number) => void;
  intervalOptionsSeconds?: number[];
  remainingSeconds: number | null;
  onReload: () => void;
  isReloading?: boolean;
  isReloadDisabled?: boolean;
  reloadLabel?: string;
  showReloadInAuto?: boolean;
  children?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  tableMaxHeightClassName?: string;
};

const themeOptions: Array<{ value: ThemePreset; label: string }> = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
];

export default function SharedViewRender({
  headingLevel: Heading = "h1",
  title,
  rowCount,
  updatedAtLabel,
  headers,
  rows,
  themePreset,
  allowThemeSwitch = false,
  onThemeChange,
  reloadMode,
  onReloadModeChange,
  intervalSeconds,
  onIntervalSecondsChange,
  intervalOptionsSeconds = [10, 30, 60],
  remainingSeconds,
  onReload,
  isReloading = false,
  isReloadDisabled = false,
  reloadLabel = "Reload",
  showReloadInAuto = false,
  children,
  emptyTitle = "Chưa có dữ liệu để hiển thị",
  emptyDescription,
  tableMaxHeightClassName = "max-h-[calc(100vh-220px)]",
}: SharedViewRenderProps) {
  const EmptyHeading = Heading === "h1" ? "h2" : "h3";

  return (
    <div
      className={styles.view}
      data-embedded={Heading === "h2" ? "true" : undefined}
    >
      <header className={styles.header}>
        <div className={styles.headingRow}>
          <div className={styles.identity}>
            <Heading>{title}</Heading>
            <div className={styles.metadata}>
              <span>{rowCount} dòng</span>
              <span>Cập nhật {updatedAtLabel}</span>
            </div>
          </div>
          {allowThemeSwitch ? (
            <div
              className={styles.segmented}
              role="group"
              aria-label="Giao diện bảng"
            >
              {themeOptions.map(({ value, label }) => (
                <button
                  className={styles.choice}
                  key={value}
                  onClick={() => onThemeChange?.(value)}
                  aria-pressed={value === themePreset}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.toolbar}>
          <div className={styles.controls}>
            <div
              className={styles.segmented}
              data-preview-control="reload-mode"
              role="group"
              aria-label="Chế độ tải lại"
            >
              <button
                className={styles.choice}
                onClick={() => onReloadModeChange("manual")}
                aria-pressed={reloadMode === "manual"}
                type="button"
              >
                Thủ công
              </button>
              <button
                className={styles.choice}
                onClick={() => onReloadModeChange("auto")}
                aria-pressed={reloadMode === "auto"}
                type="button"
              >
                Tự động
              </button>
            </div>
            {reloadMode === "auto" ? (
              <label className={styles.interval}>
                <span>Chu kỳ</span>
                <select
                  onChange={(event) =>
                    onIntervalSecondsChange(Number(event.target.value))
                  }
                  value={intervalSeconds}
                >
                  {intervalOptionsSeconds.map((option) => (
                    <option key={option} value={option}>
                      {option} giây
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {reloadMode === "manual" || showReloadInAuto ? (
              <SharedButton
                disabled={isReloading || isReloadDisabled}
                aria-busy={isReloading}
                onClick={onReload}
                data-action="reload"
              >
                {isReloading ? "Đang tải..." : reloadLabel}
              </SharedButton>
            ) : null}
          </div>
          <p className={styles.refreshHint}>
            {reloadMode === "auto"
              ? `Tự động tải lại sau ${remainingSeconds ?? intervalSeconds} giây`
              : `Thủ công: bấm ${reloadLabel} để cập nhật dữ liệu`}
          </p>
        </div>
      </header>
      {children ??
        (rows.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.stateIcon}>
              <TableIcon />
            </span>
            <EmptyHeading>{emptyTitle}</EmptyHeading>
            {emptyDescription ? <p>{emptyDescription}</p> : null}
          </div>
        ) : (
          <ViewerTable
            headers={headers}
            rows={rows}
            themePreset={themePreset}
            tableMaxHeightClassName={tableMaxHeightClassName}
            caption={title}
          />
        ))}
    </div>
  );
}
