import type { ThemePreset } from "@/src/types/view";

export type ReloadMode = "manual" | "auto";

type SharedViewRenderProps = {
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
  emptyTitle?: string;
  emptyDescription?: string;
  tableMaxHeightClassName?: string;
};

type ViewerThemeClasses = {
  wrapper: string;
  table: string;
  header: string;
  headerCell: string;
  row: string;
  cell: string;
};

const themeOptions: Array<{
  value: ThemePreset;
  label: string;
}> = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
];

const themeClasses: Record<ThemePreset, ViewerThemeClasses> = {
  modern: {
    wrapper: "border-blue-100 bg-white shadow-[0_18px_60px_rgba(30,58,138,0.10)]",
    table: "border-separate border-spacing-0",
    header: "sticky top-0 z-10 bg-blue-50",
    headerCell: "border-b border-blue-100 px-5 py-4 text-sm font-bold text-blue-950",
    row: "transition-colors hover:bg-blue-50/50",
    cell: "border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-700",
  },
  classic: {
    wrapper: "border-slate-300 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]",
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-slate-200",
    headerCell: "border border-slate-300 px-5 py-4 text-sm font-bold text-slate-900",
    row: "",
    cell: "border border-slate-300 px-5 py-4 text-sm font-medium text-slate-800",
  },
  minimal: {
    wrapper: "border-slate-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
    table: "border-collapse",
    header: "sticky top-0 z-10 bg-white",
    headerCell: "border-b border-slate-200 px-5 py-4 text-sm font-bold text-slate-900",
    row: "transition-colors hover:bg-slate-50",
    cell: "border-b border-slate-100 px-5 py-4 text-sm font-medium text-slate-700",
  },
};

export default function SharedViewRender({
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
  emptyTitle = "Chưa có dữ liệu để hiển thị",
  emptyDescription,
  tableMaxHeightClassName = "max-h-[calc(100vh-220px)]",
}: SharedViewRenderProps) {
  const columnCount = Math.max(headers.length, ...rows.map((row) => row.length), 0);
  const normalizedHeaders = Array.from({ length: columnCount }, (_, index) => {
    const header = headers[index]?.trim();
    return header ?? "";
  });
  const theme = themeClasses[themePreset];
  const hasRows = rows.length > 0;

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-bold text-slate-900">{title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
              <span>{rowCount} dòng</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>Cập nhật {updatedAtLabel}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>
                {reloadMode === "auto"
                  ? `Tự động tải lại sau ${remainingSeconds ?? intervalSeconds} giây`
                  : "Thủ công: bấm Reload để cập nhật dữ liệu"}
              </span>
            </div>
          </div>

          {allowThemeSwitch ? (
            <div className="flex shrink-0 rounded-md border border-slate-200 bg-slate-50 p-1">
              {themeOptions.map((themeOption) => {
                const active = themeOption.value === themePreset;

                return (
                  <button
                    className={`h-9 rounded px-3 text-sm font-bold transition-colors ${
                      active
                        ? "bg-white text-blue-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    key={themeOption.value}
                    onClick={() => onThemeChange?.(themeOption.value)}
                    type="button"
                  >
                    {themeOption.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
            <button
              className={`h-9 rounded px-3 text-sm font-bold transition-colors ${
                reloadMode === "manual"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => onReloadModeChange("manual")}
              type="button"
            >
              Thủ công
            </button>
            <button
              className={`h-9 rounded px-3 text-sm font-bold transition-colors ${
                reloadMode === "auto"
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              onClick={() => onReloadModeChange("auto")}
              type="button"
            >
              Tự động
            </button>
          </div>

          {reloadMode === "auto" ? (
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <span>Chu kỳ</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => onIntervalSecondsChange(Number(event.target.value))}
                value={intervalSeconds}
              >
                {intervalOptionsSeconds.map((option) => (
                  <option key={option} value={option}>
                    {option} giây
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <button
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-4 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isReloading}
              onClick={onReload}
              type="button"
            >
              {isReloading ? "Đang tải..." : "Reload"}
            </button>
          )}
        </div>
      </header>

      {!hasRows ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-xl font-bold text-slate-900">{emptyTitle}</p>
          {emptyDescription ? (
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-500">
              {emptyDescription}
            </p>
          ) : null}
        </div>
      ) : (
        <div className={`overflow-hidden rounded-lg border ${theme.wrapper}`}>
          <div className={`${tableMaxHeightClassName} overflow-auto`}>
            <table
              className={`w-full text-left ${theme.table}`}
              style={{ minWidth: `${Math.max(760, normalizedHeaders.length * 180)}px` }}
            >
              <thead className={theme.header}>
                <tr>
                  {normalizedHeaders.map((header, index) => (
                    <th className={theme.headerCell} key={`${header}-${index}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr className={theme.row} key={`viewer-row-${rowIndex}`}>
                    {normalizedHeaders.map((_, cellIndex) => (
                      <td
                        className={`max-w-[320px] whitespace-pre-wrap break-words ${theme.cell}`}
                        key={`viewer-cell-${rowIndex}-${cellIndex}`}
                      >
                        {row[cellIndex] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
