import { CopyIcon, ExternalIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import ViewSummary from "@/src/components/owner/views/view-summary";
import type { ViewWizardState } from "@/src/features/owner/views/hooks/use-view-wizard";

export default function WizardPublishStep({
  wizard,
}: {
  wizard: ViewWizardState;
}) {
  return (
    <section className="space-y-6" aria-label="Kiểm tra và xuất bản view">
      <div className="ui-wizard-publish-grid">
        <ViewSummary
          dataSourceTitle={wizard.selectedDataSource?.title ?? ""}
          name={wizard.formValues.name}
          rangeA1Notation={wizard.formValues.rangeA1Notation}
          selectionType={wizard.formValues.selectionType}
          sourceSheetName={wizard.selectedSheetName}
          themePreset={wizard.formValues.themePreset}
        />
        <section className="ui-panel">
          <div className="ui-panel-header">
            <div>
              <h2>Chia sẻ view</h2>
              <p>Chọn ai có thể truy cập trang dữ liệu.</p>
            </div>
          </div>
          <div className="ui-wizard-panel-body space-y-6">
            <fieldset>
              <legend className="ui-field-label">Quyền truy cập</legend>
              <div className="space-y-3">
                {[
                  {
                    value: "public",
                    title: "Công khai",
                    description: "Ai có link đều có thể xem.",
                  },
                  {
                    value: "private",
                    title: "Riêng tư",
                    description:
                      "Chỉ người được cấp quyền hoặc có link chia sẻ hợp lệ mới xem được.",
                  },
                ].map((option) => (
                  <label
                    className="ui-wizard-choice"
                    data-selected={wizard.accessMode === option.value}
                    key={option.value}
                  >
                    <input
                      checked={wizard.accessMode === option.value}
                      name="accessMode"
                      onChange={() => wizard.setAccessMode(option.value)}
                      type="radio"
                      value={option.value}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-xs leading-6 text-muted">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="border-t border-line pt-6">
              <label className="ui-field-label" htmlFor="wizard-published-url">
                Đường dẫn truy cập
              </label>
              <input
                className="ui-form-control"
                id="wizard-published-url"
                readOnly
                type="text"
                value={wizard.viewUrlLabel}
              />
              {wizard.hasPublishedLink ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <SharedButton
                    variant="outlined"
                    onClick={wizard.handleCopyLink}
                  >
                    <CopyIcon />
                    Copy
                  </SharedButton>
                  <SharedButton onClick={wizard.handleOpenView}>
                    <ExternalIcon />
                    Mở View
                  </SharedButton>
                </div>
              ) : (
                <p className="ui-field-help">
                  Đường dẫn sẽ có sau khi bạn xuất bản view.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
      <div className="ui-wizard-footer">
        <SharedButton variant="outlined" onClick={() => wizard.goToStep(2)}>
          Quay lại
        </SharedButton>
        <SharedButton
          disabled={wizard.isPublishDisabled}
          onClick={wizard.handlePublish}
        >
          {wizard.isPublishPending
            ? "Đang xuất bản..."
            : wizard.isEditingPublishedView
              ? "Lưu & xuất bản lại"
              : "Xuất bản"}
        </SharedButton>
      </div>
    </section>
  );
}
