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
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Theme hiển thị</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Chọn kiểu hiển thị phù hợp với bảng dữ liệu.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {presets.map((preset) => {
          const selected = preset.value === value;

          return (
            <button
              className={`flex min-h-[168px] flex-col rounded-md border px-3 py-3 text-left transition-colors ${
                selected
                  ? "border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50"
              }`}
              key={preset.value}
              onClick={() => onChange(preset.value)}
              type="button"
            >
              <span
                className={`flex h-12 w-full flex-col justify-center rounded border p-2 ${preset.previewClassName}`}
              >
                <span
                  className={`mb-1 block h-2.5 rounded-sm ${preset.headerClassName}`}
                />
                <span
                  className={`mb-1 block h-2 rounded-sm ${preset.rowClassName}`}
                />
                <span
                  className={`block h-2 rounded-sm ${preset.rowClassName}`}
                />
              </span>
              <span className="mt-3 block text-sm font-bold leading-5">
                {preset.label}
              </span>
              <span className="mt-1 block flex-1 text-xs font-medium leading-5 text-slate-500">
                {preset.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
