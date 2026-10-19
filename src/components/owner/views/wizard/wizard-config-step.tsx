import { SharedButton } from "@/src/components/share";
import ViewForm from "@/src/components/owner/views/view-form";
import PreviewTable from "@/src/components/owner/views/preview-table";
import type { ViewWizardState } from "@/src/features/owner/views/hooks/use-view-wizard";

export default function WizardConfigStep({
  wizard,
}: {
  wizard: ViewWizardState;
}) {
  return (
    <section className="space-y-6" aria-label="Cấu hình và xem trước dữ liệu">
      <div className="ui-wizard-config-grid">
        <ViewForm
          errors={wizard.formErrors}
          isLoadingSheets={wizard.isLoadingSheets}
          isPreviewing={wizard.isPreviewing}
          onChange={wizard.changeForm}
          onPreview={wizard.handlePreview}
          onRetrySheets={wizard.retrySheets}
          sheets={wizard.sheets}
          sheetsErrorMessage={wizard.sheetsError}
          values={wizard.formValues}
        />
        <section
          className="ui-panel ui-wizard-preview"
          aria-label="Bản xem trước"
        >
          <PreviewTable
            errorMessage={wizard.previewError}
            intervalSeconds={wizard.previewIntervalSeconds}
            isLoading={wizard.isPreviewing}
            onIntervalSecondsChange={wizard.changePreviewInterval}
            onReload={wizard.handlePreview}
            onReloadModeChange={wizard.setPreviewReloadMode}
            preview={wizard.preview}
            reloadMode={wizard.previewReloadMode}
            remainingSeconds={wizard.previewRemainingSeconds}
            themePreset={wizard.formValues.themePreset}
          />
        </section>
      </div>
      <div className="ui-wizard-footer">
        <SharedButton variant="outlined" onClick={() => wizard.goToStep(1)}>
          Quay lại
        </SharedButton>
        <div className="flex flex-wrap gap-3">
          <SharedButton
            variant="outlined"
            disabled={wizard.isDraftSaving}
            onClick={() => wizard.saveDraft(false)}
          >
            {wizard.isDraftSaving ? "Đang lưu..." : "Lưu nháp"}
          </SharedButton>
          <SharedButton
            disabled={wizard.isDraftSaving}
            onClick={wizard.handleContinueFromConfig}
          >
            {wizard.isDraftSaving ? "Đang lưu..." : "Tiếp tục"}
          </SharedButton>
        </div>
      </div>
    </section>
  );
}
