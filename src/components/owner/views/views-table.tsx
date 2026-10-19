import AppLink from "@/src/components/app-link";
import EmptyState from "@/src/components/common/empty-state";
import { SheetIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import {
  ViewAccessBadge,
  ViewStatusBadge,
} from "@/src/components/owner/views/view-badges";
import {
  formatDateTime,
  getPublishedUrl,
  getSelectionLabel,
  isPublishedView,
} from "@/src/features/owner/views/view-utils";
import type { OwnerView } from "@/src/types/view";

type ViewsTableProps = {
  views: OwnerView[];
  isLoading: boolean;
  errorMessage: string | null;
  hasFilters: boolean;
  publishPending: boolean;
  deletingId: string | null | undefined;
  onRetry: () => void;
  onDetail: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (view: OwnerView) => void;
  onPublish: (view: OwnerView) => void;
  onDelete: (view: OwnerView) => void;
};

function LoadingRows() {
  return Array.from({ length: 5 }, (_, row) => (
    <tr aria-hidden="true" key={row}>
      {Array.from({ length: 10 }, (_, cell) => (
        <td key={cell}>
          <span className="ui-skeleton h-6 w-full" />
        </td>
      ))}
    </tr>
  ));
}

export default function ViewsTable(props: ViewsTableProps) {
  if (!props.isLoading && props.errorMessage)
    return (
      <EmptyState
        title="Không thể tải danh sách view"
        description={props.errorMessage}
        icon={<SheetIcon />}
        action={<SharedButton onClick={props.onRetry}>Thử lại</SharedButton>}
      />
    );
  if (!props.isLoading && props.views.length === 0)
    return (
      <EmptyState
        title={
          props.hasFilters ? "Không tìm thấy view phù hợp" : "Chưa có view nào"
        }
        description="Tạo view để chia sẻ dữ liệu từ Google Sheets."
        icon={<SheetIcon />}
        action={
          <AppLink className="ui-button" href="/owner/views/new">
            Tạo view mới
          </AppLink>
        }
      />
    );

  return (
    <div aria-busy={props.isLoading}>
      {props.isLoading ? (
        <span role="status" className="sr-only">
          Đang tải danh sách view
        </span>
      ) : null}
      <div
        className="ui-table-region"
        role="region"
        tabIndex={0}
        aria-label="Bảng quản lý view, có thể cuộn ngang"
      >
        <table className="ui-table ui-views-table">
          <caption className="sr-only">
            Các view và thao tác xuất bản, chia sẻ, chỉnh sửa
          </caption>
          <colgroup>
            {[240, 160, 144, 208, 160, 144, 96, 176, 200, 224].map(
              (width, index) => (
                <col style={{ width }} key={index} />
              ),
            )}
          </colgroup>
          <thead>
            <tr>
              {[
                "Tên view",
                "Trạng thái",
                "Quyền",
                "Nguồn dữ liệu",
                "Sheet",
                "Vùng dữ liệu",
                "Số dòng",
                "Cập nhật",
                "Link",
                "Hành động",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.isLoading ? (
              <LoadingRows />
            ) : (
              props.views.map((view) => {
                const publishedUrl = getPublishedUrl(view);
                const canPublish = view.status === "draft";
                const canEdit = canPublish || isPublishedView(view);
                const canShare = isPublishedView(view);
                const shareLabel =
                  view.accessMode === "private" ? "Phân quyền" : "Chia sẻ";
                return (
                  <tr key={view.id}>
                    <td>
                      <p className="font-medium text-ink [overflow-wrap:anywhere]">
                        {view.name}
                      </p>
                    </td>
                    <td>
                      <ViewStatusBadge status={view.status} />
                    </td>
                    <td>
                      <ViewAccessBadge accessMode={view.accessMode} />
                    </td>
                    <td>{view.dataSource?.title ?? "—"}</td>
                    <td>{view.sourceSheet?.sheetName ?? "—"}</td>
                    <td>
                      {getSelectionLabel(
                        view.selectionType,
                        view.rangeA1Notation,
                      )}
                    </td>
                    <td className="tabular-nums">
                      {view.currentSnapshot?.rowCount ?? "—"}
                    </td>
                    <td>{formatDateTime(view.currentSnapshot?.fetchedAt)}</td>
                    <td>
                      {publishedUrl ? (
                        <a
                          className="ui-view-public-link"
                          href={publishedUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                          title={publishedUrl}
                        >
                          {publishedUrl}
                        </a>
                      ) : (
                        <span className="text-muted">Chưa xuất bản</span>
                      )}
                    </td>
                    <td>
                      <div className="ui-view-actions">
                        <SharedButton
                          size="sm"
                          variant="outlined"
                          onClick={() => props.onDetail(view.id)}
                        >
                          Chi tiết
                        </SharedButton>
                        {canEdit ? (
                          <SharedButton
                            size="sm"
                            variant="outlined"
                            onClick={() => props.onEdit(view.id)}
                          >
                            Sửa
                          </SharedButton>
                        ) : null}
                        {canPublish ? (
                          <SharedButton
                            size="sm"
                            disabled={props.publishPending}
                            onClick={() => props.onPublish(view)}
                          >
                            Xuất bản
                          </SharedButton>
                        ) : null}
                        <SharedButton
                          size="sm"
                          variant="outlined"
                          disabled={!canShare}
                          title={
                            canShare
                              ? shareLabel
                              : "Cần publish view trước khi chia sẻ"
                          }
                          onClick={() => props.onShare(view)}
                        >
                          {shareLabel}
                        </SharedButton>
                        <SharedButton
                          size="sm"
                          variant="danger"
                          disabled={props.deletingId === view.id}
                          onClick={() => props.onDelete(view)}
                        >
                          {props.deletingId === view.id ? "Đang xóa" : "Xóa"}
                        </SharedButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-muted">
        Cuộn ngang để xem đầy đủ thông tin. Các thao tác quản lý nằm ở cột cuối.
      </p>
    </div>
  );
}
