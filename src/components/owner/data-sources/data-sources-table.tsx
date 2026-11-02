import EmptyState from "@/src/components/common/empty-state";
import { SheetIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import StatusBadge from "@/src/components/owner/data-sources/status-badge";
import type { DataSource } from "@/src/types/data-source";
import { getDataSourceUrl } from "@/src/features/owner/data-sources/data-source-utils";

type DataSourcesTableProps = {
  dataSources: DataSource[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry: () => void;
  onEdit: (dataSource: DataSource) => void;
  onDelete: (dataSource: DataSource) => void;
  onSync: (dataSource: DataSource) => void;
  updatingId?: string | null;
  deletingId?: string | null;
  syncingId?: string | null;
};

function getSourceTypeLabel(sourceType: string) {
  const normalized = sourceType.trim().toLowerCase();
  return normalized === "google_sheet"
    ? "Google Sheet"
    : sourceType || "Google Sheet";
}

function formatDateTime(dateTime: string) {
  const parsed = new Date(dateTime);
  if (Number.isNaN(parsed.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function LoadingRows() {
  return Array.from({ length: 5 }, (_, rowIndex) => (
    <tr key={`source-loading-${rowIndex}`} aria-hidden="true">
      {Array.from({ length: 7 }, (_, cellIndex) => (
        <td key={cellIndex}>
          <span
            className={`ui-skeleton ${cellIndex === 0 ? "h-11 w-44" : "h-6 w-full"}`}
          />
        </td>
      ))}
    </tr>
  ));
}

export default function DataSourcesTable({
  dataSources,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onEdit,
  onDelete,
  onSync,
  updatingId = null,
  deletingId = null,
  syncingId = null,
}: DataSourcesTableProps) {
  if (!isLoading && errorMessage) {
    return (
      <EmptyState
        title="Không thể tải danh sách nguồn dữ liệu"
        description={errorMessage}
        icon={<SheetIcon />}
        action={<SharedButton onClick={onRetry}>Thử lại</SharedButton>}
      />
    );
  }
  if (!isLoading && dataSources.length === 0) {
    return (
      <EmptyState
        title="Chưa có nguồn dữ liệu nào"
        description="Bấm Thêm nguồn mới để kết nối Google Sheet đầu tiên."
        icon={<SheetIcon />}
      />
    );
  }

  return (
    <div aria-busy={isLoading}>
      {isLoading ? (
        <span className="sr-only" role="status">
          Đang tải nguồn dữ liệu
        </span>
      ) : null}
      <div
        className="ui-table-region"
        role="region"
        tabIndex={0}
        aria-label="Bảng nguồn dữ liệu, có thể cuộn ngang"
      >
        <table className="ui-table ui-sources-table">
          <caption className="sr-only">
            Nguồn dữ liệu đã kết nối và các thao tác quản lý
          </caption>
          <colgroup>
            <col className="w-60" />
            <col className="w-32" />
            <col className="w-24" />
            <col className="w-36" />
            <col className="w-44" />
            <col className="w-64" />
            <col className="w-40" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Tên nguồn</th>
              <th scope="col">Loại nguồn</th>
              <th scope="col">Số sheet</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Thời gian đăng</th>
              <th scope="col">Lỗi nếu có</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <LoadingRows />
            ) : (
              dataSources.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="ui-source-icon">
                        <SheetIcon />
                      </span>
                      <p className="min-w-0 font-medium break-words text-ink">
                        {item.title}
                      </p>
                    </div>
                  </td>
                  <td>{getSourceTypeLabel(item.sourceType)}</td>
                  <td className="whitespace-nowrap tabular-nums">
                    {item.sheetCount} sheet
                  </td>
                  <td>
                    <StatusBadge status={item.sourceStatus} />
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>
                    {item.lastError ? (
                      <p className="ui-source-error">{item.lastError}</p>
                    ) : (
                      <span aria-label="Không có lỗi">—</span>
                    )}
                  </td>
                  <td>
                    <div className="grid grid-cols-2 gap-2">
                      <SharedButton
                        className="col-span-2"
                        variant="outlined"
                        size="sm"
                        aria-label={`Đồng bộ danh sách sheet của ${item.title}`}
                        aria-busy={syncingId === item.id}
                        disabled={
                          Boolean(syncingId || updatingId || deletingId) ||
                          !getDataSourceUrl(item)
                        }
                        title={
                          getDataSourceUrl(item)
                            ? "Lấy lại danh sách tab từ Google Sheets"
                            : "Chọn Sửa để bổ sung link Google Sheets"
                        }
                        onClick={() => onSync(item)}
                      >
                        {syncingId === item.id
                          ? "Đang đồng bộ..."
                          : "Đồng bộ sheet"}
                      </SharedButton>
                      <SharedButton
                        variant="outlined"
                        size="sm"
                        disabled={
                          Boolean(syncingId || deletingId) ||
                          updatingId === item.id
                        }
                        onClick={() => onEdit(item)}
                      >
                        {updatingId === item.id ? "Đang sửa..." : "Sửa"}
                      </SharedButton>
                      <SharedButton
                        variant="danger"
                        size="sm"
                        disabled={
                          Boolean(syncingId || updatingId) ||
                          deletingId === item.id
                        }
                        onClick={() => onDelete(item)}
                      >
                        {deletingId === item.id ? "Đang xóa..." : "Xóa"}
                      </SharedButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-5 py-3 text-xs text-muted">
        Cuộn ngang để xem đầy đủ thông tin và thao tác.
      </p>
    </div>
  );
}
