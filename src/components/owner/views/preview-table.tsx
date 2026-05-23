import SharedViewRender, {
  type ReloadMode,
} from "@/src/components/viewer/shared-view-render";
import type { DataSourcePreview } from "@/src/types/data-source";
import type { ThemePreset } from "@/src/types/view";

type PreviewTableProps = {
  preview: DataSourcePreview | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  themePreset?: ThemePreset;
  reloadMode: ReloadMode;
  onReloadModeChange: (mode: ReloadMode) => void;
  intervalSeconds: number;
  onIntervalSecondsChange: (seconds: number) => void;
  remainingSeconds: number | null;
  onReload: () => void;
};

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

function LoadingTable() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-56 animate-pulse rounded-md bg-slate-100" />
      <div className="overflow-hidden rounded-lg border border-slate-200">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="grid grid-cols-4 gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
            key={`preview-loading-${index}`}
          >
            {Array.from({ length: 4 }).map((__, cellIndex) => (
              <div
                className="h-5 animate-pulse rounded bg-slate-100"
                key={`preview-loading-${index}-${cellIndex}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreviewTable({
  preview,
  isLoading = false,
  errorMessage = null,
  themePreset = "modern",
  reloadMode,
  onReloadModeChange,
  intervalSeconds,
  onIntervalSecondsChange,
  remainingSeconds,
  onReload,
}: PreviewTableProps) {
  if (isLoading) {
    return <LoadingTable />;
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-bold text-red-700">Không thể preview dữ liệu</p>
        <p className="mt-1 text-sm font-medium text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <SharedViewRender
      allowThemeSwitch={false}
      emptyDescription="Chọn sheet và bấm Reload để kiểm tra dữ liệu trước khi xuất bản."
      emptyTitle="Chưa có dữ liệu preview"
      headers={preview?.headers ?? []}
      intervalOptionsSeconds={[10, 30, 60]}
      intervalSeconds={intervalSeconds}
      onIntervalSecondsChange={onIntervalSecondsChange}
      onReload={onReload}
      onReloadModeChange={onReloadModeChange}
      remainingSeconds={remainingSeconds}
      reloadMode={reloadMode}
      rowCount={preview?.rowCount ?? 0}
      rows={preview?.rows ?? []}
      tableMaxHeightClassName="max-h-[520px]"
      themePreset={themePreset}
      title={preview?.sheetName || "Bản xem trước trực tiếp"}
      updatedAtLabel={formatDateTime(preview?.previewedAt)}
    />
  );
}
