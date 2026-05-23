import ThemeEditor from "@/src/components/owner/views/theme-editor";
import type { DataSourceSheet } from "@/src/types/data-source";
import type { ThemePreset, ViewSelectionType } from "@/src/types/view";

export type ViewDraftFormValues = {
  name: string;
  sourceSheetId: string;
  selectionType: ViewSelectionType;
  rangeA1Notation: string;
  useFirstRowAsHeader: boolean;
  themePreset: ThemePreset;
};

export type ViewDraftFormErrors = Partial<
  Record<keyof ViewDraftFormValues, string>
>;

type ViewFormProps = {
  values: ViewDraftFormValues;
  errors: ViewDraftFormErrors;
  sheets: DataSourceSheet[];
  isLoadingSheets?: boolean;
  sheetsErrorMessage?: string | null;
  onChange: (values: ViewDraftFormValues) => void;
  onPreview: () => void;
  onRetrySheets: () => void;
  isPreviewing?: boolean;
};

function getSheetName(sheet: DataSourceSheet, index: number) {
  return sheet.sheetName || sheet.title || `Sheet ${index + 1}`;
}

export default function ViewForm({
  values,
  errors,
  sheets,
  isLoadingSheets = false,
  sheetsErrorMessage = null,
  onChange,
  onPreview,
  onRetrySheets,
  isPreviewing = false,
}: ViewFormProps) {
  function updateField<TField extends keyof ViewDraftFormValues>(
    field: TField,
    value: ViewDraftFormValues[TField],
  ) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-base font-bold text-slate-900">Cấu hình dữ liệu</h2>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block" htmlFor="view-name">
            <span className="text-sm font-bold text-slate-700">Tên View</span>
            <input
              aria-invalid={Boolean(errors.name)}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              id="view-name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ví dụ: Bảng điểm lớp A"
              type="text"
              value={values.name}
            />
            {errors.name ? (
              <p className="mt-1.5 text-sm font-semibold text-red-600">
                {errors.name}
              </p>
            ) : null}
          </label>

          <div>
            <label
              className="text-sm font-bold text-slate-700"
              htmlFor="source-sheet"
            >
              Chọn sheet/tab
            </label>
            <select
              aria-invalid={Boolean(errors.sourceSheetId)}
              className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              disabled={isLoadingSheets || Boolean(sheetsErrorMessage)}
              id="source-sheet"
              onChange={(event) =>
                updateField("sourceSheetId", event.target.value)
              }
              value={values.sourceSheetId}
            >
              <option value="">
                {isLoadingSheets ? "Đang tải sheet..." : "Chọn sheet"}
              </option>
              {sheets.map((sheet, index) => (
                <option key={sheet.id} value={sheet.id}>
                  {getSheetName(sheet, index)}
                </option>
              ))}
            </select>
            {errors.sourceSheetId ? (
              <p className="mt-1.5 text-sm font-semibold text-red-600">
                {errors.sourceSheetId}
              </p>
            ) : null}
            {sheetsErrorMessage ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-3">
                <p className="text-sm font-semibold text-red-700">
                  {sheetsErrorMessage}
                </p>
                <button
                  className="mt-2 text-sm font-bold text-red-700 underline"
                  onClick={onRetrySheets}
                  type="button"
                >
                  Thử lại
                </button>
              </div>
            ) : null}
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-slate-700">
              Phạm vi dữ liệu
            </legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "full_sheet",
                  label: "Toàn bộ sheet",
                  hint: "Lấy từ đầu sheet",
                },
                {
                  value: "range",
                  label: "Vùng dữ liệu/range",
                  hint: "Chọn range A1",
                },
              ].map((option) => {
                const selected = values.selectionType === option.value;

                return (
                  <label
                    className={`flex min-h-[76px] cursor-pointer items-start gap-3 rounded-md border px-3 py-3 transition-colors ${
                      selected
                        ? "border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    key={option.value}
                  >
                    <input
                      checked={selected}
                      className="mt-1 h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-700"
                      name="selectionType"
                      onChange={() =>
                        updateField(
                          "selectionType",
                          option.value as ViewSelectionType,
                        )
                      }
                      type="radio"
                    />
                    <span>
                      <span className="block text-sm font-bold leading-5">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-slate-500">
                        {option.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {values.selectionType === "range" ? (
            <label className="block" htmlFor="range-a1">
              <span className="text-sm font-bold text-slate-700">Range A1</span>
              <input
                aria-invalid={Boolean(errors.rangeA1Notation)}
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                id="range-a1"
                onChange={(event) =>
                  updateField("rangeA1Notation", event.target.value)
                }
                placeholder="A1:D10"
                type="text"
                value={values.rangeA1Notation}
              />
              {errors.rangeA1Notation ? (
                <p className="mt-1.5 text-sm font-semibold text-red-600">
                  {errors.rangeA1Notation}
                </p>
              ) : null}
            </label>
          ) : null}

          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
            <input
              checked={values.useFirstRowAsHeader}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
              onChange={(event) =>
                updateField("useFirstRowAsHeader", event.target.checked)
              }
              type="checkbox"
            />
            <span className="text-sm font-semibold text-slate-700">
              Dùng dòng đầu làm header
            </span>
          </label>

          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-md border border-blue-700 bg-white px-4 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPreviewing || isLoadingSheets}
            onClick={onPreview}
            type="button"
          >
            {isPreviewing ? "Đang tải dữ liệu..." : "Preview"}
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <ThemeEditor
          onChange={(themePreset) => updateField("themePreset", themePreset)}
          value={values.themePreset}
        />
      </section>
    </div>
  );
}
