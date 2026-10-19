import type { ThemePreset, ViewSelectionType } from "@/src/types/view";

type ViewSummaryProps = {
  name: string;
  dataSourceTitle: string;
  sourceSheetName: string;
  selectionType: ViewSelectionType;
  rangeA1Notation: string;
  themePreset: ThemePreset;
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
  ];

  return (
    <section className="ui-panel ui-wizard-summary">
      <div className="ui-panel-header">
        <h2>Tóm tắt view</h2>
      </div>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
