import { useEffect, useRef } from "react";
import { SharedButton } from "@/src/components/share";
import ThemeEditor from "@/src/components/owner/views/theme-editor";
import type { DataSourceSheet } from "@/src/types/data-source";
import type { ViewSelectionType } from "@/src/types/view";
import type {
  ViewDraftFormValues,
  ViewDraftFormErrors,
} from "@/src/features/owner/views/wizard-types";
export type {
  ViewDraftFormValues,
  ViewDraftFormErrors,
} from "@/src/features/owner/views/wizard-types";

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
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors]);
  function updateField<TField extends keyof ViewDraftFormValues>(
    field: TField,
    value: ViewDraftFormValues[TField],
  ) {
    onChange({ ...values, [field]: value });
  }
  return (
    <div className="min-w-0 space-y-6" ref={formRef}>
      <section className="ui-panel">
        <div className="ui-panel-header">
          <div>
            <h2>Cấu hình dữ liệu</h2>
            <p>Đặt tên và chọn phần dữ liệu sẽ hiển thị.</p>
          </div>
        </div>
        <div className="ui-wizard-panel-body space-y-5">
          <div>
            <label className="ui-field-label" htmlFor="view-name">
              Tên view
            </label>
            <input
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "view-name-error" : undefined}
              className="ui-form-control"
              id="view-name"
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ví dụ: Danh mục sản phẩm"
              type="text"
              value={values.name}
            />
            {errors.name ? (
              <p className="ui-field-error" id="view-name-error" role="alert">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div>
            <label className="ui-field-label" htmlFor="source-sheet">
              Chọn sheet/tab
            </label>
            <select
              aria-invalid={Boolean(errors.sourceSheetId)}
              aria-describedby={
                errors.sourceSheetId ? "source-sheet-error" : undefined
              }
              className="ui-form-control"
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
              <p
                className="ui-field-error"
                id="source-sheet-error"
                role="alert"
              >
                {errors.sourceSheetId}
              </p>
            ) : null}
            {sheetsErrorMessage ? (
              <div className="ui-alert mt-3" role="alert">
                <p>{sheetsErrorMessage}</p>
                <SharedButton
                  className="mt-3"
                  variant="outlined"
                  size="sm"
                  onClick={onRetrySheets}
                >
                  Thử lại
                </SharedButton>
              </div>
            ) : null}
          </div>
          <fieldset>
            <legend className="ui-field-label">Phạm vi dữ liệu</legend>
            <div className="ui-wizard-range-options">
              {[
                {
                  value: "full_sheet",
                  label: "Toàn bộ sheet",
                  hint: "Lấy từ đầu sheet",
                },
                {
                  value: "range",
                  label: "Vùng dữ liệu",
                  hint: "Chọn range A1",
                },
              ].map((option) => (
                <label
                  className="ui-wizard-choice"
                  data-selected={values.selectionType === option.value}
                  key={option.value}
                >
                  <input
                    checked={values.selectionType === option.value}
                    name="selectionType"
                    onChange={() =>
                      updateField(
                        "selectionType",
                        option.value as ViewSelectionType,
                      )
                    }
                    type="radio"
                    value={option.value}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">{option.label}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {values.selectionType === "range" ? (
            <div>
              <label className="ui-field-label" htmlFor="range-a1">
                Range A1
              </label>
              <input
                aria-invalid={Boolean(errors.rangeA1Notation)}
                aria-describedby={
                  errors.rangeA1Notation ? "range-a1-error" : undefined
                }
                className="ui-form-control"
                id="range-a1"
                onChange={(event) =>
                  updateField("rangeA1Notation", event.target.value)
                }
                placeholder="A1:D10"
                type="text"
                value={values.rangeA1Notation}
              />
              {errors.rangeA1Notation ? (
                <p className="ui-field-error" id="range-a1-error" role="alert">
                  {errors.rangeA1Notation}
                </p>
              ) : null}
            </div>
          ) : null}
          <label className="ui-wizard-checkbox">
            <input
              checked={values.useFirstRowAsHeader}
              id="view-first-row-header"
              onChange={(event) =>
                updateField("useFirstRowAsHeader", event.target.checked)
              }
              type="checkbox"
            />
            <span>Dùng dòng đầu làm header</span>
          </label>
          <SharedButton
            className="w-full"
            variant="outlined"
            disabled={isPreviewing || isLoadingSheets}
            onClick={onPreview}
          >
            {isPreviewing ? "Đang tải dữ liệu..." : "Preview"}
          </SharedButton>
        </div>
      </section>
      <section className="ui-panel">
        <div className="ui-wizard-panel-body">
          <ThemeEditor
            onChange={(themePreset) => updateField("themePreset", themePreset)}
            value={values.themePreset}
          />
        </div>
      </section>
    </div>
  );
}
