import type { ThemePreset } from "@/src/types/view";

type ThemeEditorProps = {
  value: ThemePreset;
  onChange: (value: ThemePreset) => void;
};

const presets: Array<{
  value: ThemePreset;
  label: string;
  description: string;
  previewClassName: string;
  headerClassName: string;
  rowClassName: string;
}> = [
  {
    value: "modern",
    label: "Modern",
    description: "Nền sáng, header xanh nhạt.",
    previewClassName: "border-blue-100 bg-blue-50/60",
    headerClassName: "bg-blue-700",
    rowClassName: "bg-white",
  },
  {
    value: "classic",
    label: "Classic",
    description: "Viền rõ, kiểu bảng truyền thống.",
    previewClassName: "border-slate-300 bg-slate-100",
    headerClassName: "bg-slate-500",
    rowClassName: "bg-white ring-1 ring-slate-200",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Ít viền, tập trung dữ liệu.",
    previewClassName: "border-slate-100 bg-white",
    headerClassName: "bg-slate-900",
    rowClassName: "bg-slate-100",
  },
];

export default function ThemeEditor({ value, onChange }: ThemeEditorProps) {
  return (
    <fieldset>
      <legend className="ui-field-label">Theme hiển thị</legend>
      <p className="mb-4 text-xs leading-6 text-muted">
        Chọn kiểu hiển thị phù hợp với bảng dữ liệu.
      </p>
      <div className="ui-theme-options">
        {presets.map((preset) => (
          <label
            className="ui-theme-option"
            data-selected={value === preset.value}
            key={preset.value}
          >
            <span
              className={`ui-theme-swatch ${preset.previewClassName}`}
              aria-hidden="true"
            >
              <span className={preset.headerClassName} />
              <span className={preset.rowClassName} />
              <span className={preset.rowClassName} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                {preset.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {preset.description}
              </span>
            </span>
            <input
              checked={value === preset.value}
              name="themePreset"
              onChange={() => onChange(preset.value)}
              type="radio"
              value={preset.value}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
