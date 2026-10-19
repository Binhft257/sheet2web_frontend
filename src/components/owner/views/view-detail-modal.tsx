import Modal from "@/src/components/common/modal";
import QueryFeedback from "@/src/components/common/query-feedback";
import { useView } from "@/src/hooks/owner/use-views";
import {
  formatDateTime,
  getErrorMessage,
  getSelectionLabel,
  getThemePreset,
} from "@/src/features/owner/views/view-utils";

type ViewDetailModalProps = { viewId: string | null; onClose: () => void };
export default function ViewDetailModal({
  viewId,
  onClose,
}: ViewDetailModalProps) {
  const viewQuery = useView(viewId);
  if (!viewId) return null;
  const view = viewQuery.data;
  const detailItems = view
    ? [
        ["Tên view", view.name],
        ["Slug", view.slug],
        ["Trạng thái", view.status],
        ["Quyền truy cập", view.accessMode],
        [
          "Selection",
          getSelectionLabel(view.selectionType, view.rangeA1Notation),
        ],
        ["Nguồn dữ liệu", view.dataSource?.title ?? "—"],
        ["Sheet", view.sourceSheet?.sheetName ?? "—"],
        ["Dòng đầu làm header", view.useFirstRowAsHeader ? "Có" : "Không"],
        ["Cho đổi theme", view.allowThemeSwitch ? "Có" : "Không"],
        ["Theme preset", getThemePreset(view.themeOverrideJson)],
        [
          "Snapshot",
          view.currentSnapshot
            ? `${view.currentSnapshot.rowCount} dòng · ${formatDateTime(
                view.currentSnapshot.fetchedAt,
              )}`
            : "—",
        ],
      ]
    : [];

  return (
    <Modal open title="Chi tiết view" size="lg" onClose={onClose}>
      <div className="ui-modal-body">
        <QueryFeedback
          isLoading={viewQuery.isPending}
          errorMessage={
            viewQuery.isError
              ? getErrorMessage(viewQuery.error, "Không thể tải chi tiết view.")
              : null
          }
          onRetry={() => viewQuery.refetch()}
        >
          <dl className="ui-view-details">
            {detailItems.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </QueryFeedback>
      </div>
    </Modal>
  );
}
