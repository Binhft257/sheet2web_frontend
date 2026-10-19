import EmptyState from "@/src/components/common/empty-state";
import {
  CheckIcon,
  PlusIcon,
  SearchIcon,
  SheetIcon,
} from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import StatusBadge from "@/src/components/owner/data-sources/status-badge";
import {
  formatDate,
  getSourceTypeLabel,
} from "@/src/features/owner/views/wizard-utils";
import type { ViewWizardState } from "@/src/features/owner/views/hooks/use-view-wizard";

export default function WizardSourceStep({
  wizard,
}: {
  wizard: ViewWizardState;
}) {
  return (
    <section
      className="ui-panel ui-wizard-source"
      aria-labelledby="wizard-source-heading"
    >
      <div className="ui-panel-header">
        <div>
          <h2 id="wizard-source-heading">Chọn bảng tính nguồn</h2>
          <p>Chọn nguồn dữ liệu đã kết nối hoặc thêm một Google Sheet mới.</p>
        </div>
      </div>
      <div className="ui-wizard-source-toolbar">
        <div className="min-w-0 flex-1">
          <label className="ui-field-label" htmlFor="wizard-source-search">
            Tìm nguồn dữ liệu
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
            <input
              className="ui-form-control pl-11"
              id="wizard-source-search"
              type="search"
              placeholder="Tìm theo tên nguồn…"
              value={wizard.search}
              onChange={wizard.handleSearchChange}
            />
          </div>
        </div>
        <SharedButton variant="outlined" onClick={wizard.openAddModal}>
          <PlusIcon />
          Thêm nguồn dữ liệu mới
        </SharedButton>
      </div>
      {wizard.sourceLocked ? (
        <p className="ui-wizard-source-notice">
          Nguồn dữ liệu hiện tại được giữ nguyên khi chỉnh sửa view đã lưu.
        </p>
      ) : null}
      {wizard.isSourcesLoading ? (
        <div
          className="ui-wizard-source-grid"
          role="status"
          aria-label="Đang tải nguồn dữ liệu"
          aria-busy="true"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <span className="ui-skeleton h-44 w-full" key={index} />
          ))}
        </div>
      ) : wizard.sourcesError ? (
        <EmptyState
          title="Không thể tải nguồn dữ liệu"
          description={wizard.sourcesError}
          icon={<SheetIcon />}
          action={
            <SharedButton onClick={wizard.retrySources}>Thử lại</SharedButton>
          }
        />
      ) : wizard.dataSources.length === 0 ? (
        <EmptyState
          title="Chưa có nguồn dữ liệu phù hợp"
          description="Thêm Google Sheet mới để bắt đầu tạo view."
          icon={<SheetIcon />}
        />
      ) : (
        <div className="ui-wizard-source-grid">
          {wizard.dataSources.map((source) => {
            const selected = source.id === wizard.selectedDataSourceId;
            const disabled = wizard.sourceLocked && !selected;
            return (
              <button
                className="ui-source-choice"
                aria-pressed={selected}
                disabled={disabled}
                key={source.id}
                onClick={() => wizard.handleSelectSource(source)}
                type="button"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="ui-source-icon">
                    <SheetIcon />
                  </span>
                  <span className="ui-source-choice-check" aria-hidden="true">
                    {selected ? <CheckIcon /> : null}
                  </span>
                </span>
                <span className="mt-4 block font-medium text-ink [overflow-wrap:anywhere]">
                  {source.title}
                </span>
                <span className="mt-2 block text-xs text-muted">
                  {getSourceTypeLabel(source.sourceType)} · {source.sheetCount}{" "}
                  sheet
                </span>
                <span className="ui-source-choice-meta">
                  <StatusBadge status={source.sourceStatus} />
                  <span>
                    {formatDate(source.updatedAt || source.createdAt)}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            className="ui-source-choice ui-source-choice-add"
            onClick={wizard.openAddModal}
            type="button"
          >
            <PlusIcon className="h-6 w-6" />
            <span className="font-medium text-ink">Thêm nguồn dữ liệu mới</span>
            <span className="text-xs text-muted">
              Kết nối một Google Sheet khác
            </span>
          </button>
        </div>
      )}
      <div className="ui-wizard-footer">
        <p className="min-w-0 text-sm text-muted">
          Đã chọn:{" "}
          <strong className="font-medium text-ink [overflow-wrap:anywhere]">
            {wizard.selectedDataSource?.title ?? "Chưa chọn nguồn"}
          </strong>
        </p>
        <SharedButton
          disabled={!wizard.selectedDataSourceId}
          onClick={wizard.handleNextFromSource}
        >
          Tiếp tục
        </SharedButton>
      </div>
    </section>
  );
}
