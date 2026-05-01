import type { ViewRefreshMode } from "@/src/components/owner/views/view-form";
import type { ThemePreset, ViewSelectionType } from "@/src/types/view";

type ViewSummaryProps = {
  name: string;
  dataSourceTitle: string;
  sourceSheetName: string;
  selectionType: ViewSelectionType;
  rangeA1Notation: string;
  themePreset: ThemePreset;
  refreshMode: ViewRefreshMode;
  refreshIntervalSeconds: number;
};

function getSelectionLabel(selectionType: ViewSelectionType) {
  return selectionType === "range" ? "Vùng dữ liệu" : "Toàn bộ sheet";
}

function getThemeLabel(themePreset: ThemePreset) {
  const labels: Record<ThemePreset, string> = {
    modern: "Modern",
    classic: "Classic",
    minimal: "Minimal",
  };

  return labels[themePreset];
}

export default function ViewSummary({
  name,
  dataSourceTitle,
  sourceSheetName,
  selectionType,
  rangeA1Notation,
  themePreset,
  refreshMode,
  refreshIntervalSeconds,
}: ViewSummaryProps) {
  const items = [
    {
      label: "Tên View",
      value: name || "--",
    },
    {
      label: "Nguồn dữ liệu",
      value: dataSourceTitle || "--",
    },
    {
      label: "Sheet",
      value: sourceSheetName || "--",
    },
    {
      label: "Phạm vi",
      value:
        selectionType === "range"
          ? `${getSelectionLabel(selectionType)} ${rangeA1Notation || ""}`
          : getSelectionLabel(selectionType),
    },
    {
      label: "Theme",
      value: getThemeLabel(themePreset),
    },
    {
      label: "Refresh",
      value:
        refreshMode === "interval"
          ? `${refreshIntervalSeconds || 60} giây`
          : "Thủ công",
    },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h2 className="text-base font-bold text-slate-900">Tóm tắt View</h2>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
            key={item.label}
          >
            <dt className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {item.label}
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
