import AppLink from "@/src/components/app-link";
import EmptyState from "@/src/components/common/empty-state";
import { ChevronRightIcon, SheetIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import { ViewAccessBadge, ViewStatusBadge } from "./view-badges";
import ViewLinkActions from "./view-link-actions";
import {
  formatDateTime,
  getPublishedUrl,
} from "@/src/features/owner/views/view-utils";
import type { OwnerView } from "@/src/types/view";
import styles from "./views.module.css";

type ViewsTableProps = {
  views: OwnerView[];
  isLoading: boolean;
  errorMessage: string | null;
  hasFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onDetail: (id: string) => void;
  onCopy: (url: string) => void;
};

function ViewIdentity({
  view,
  onDetail,
}: {
  view: OwnerView;
  onDetail: ViewsTableProps["onDetail"];
}) {
  return (
    <div className={styles.identity}>
      <button
        className={styles.name}
        type="button"
        onClick={() => onDetail(view.id)}
        aria-label={`Xem chi tiết: ${view.name}`}
      >
        <span>{view.name}</span>
        <ChevronRightIcon />
      </button>
      <p className={styles.source}>
        {view.dataSource?.title ?? "Không có thông tin nguồn"}
      </p>
    </div>
  );
}

function ViewBadges({ view }: { view: OwnerView }) {
  return (
    <div className={styles.badges}>
      <ViewStatusBadge status={view.status} />
      <ViewAccessBadge accessMode={view.accessMode} />
    </div>
  );
}

function ViewAccess({
  view,
  onCopy,
  compact = false,
}: {
  view: OwnerView;
  onCopy: ViewsTableProps["onCopy"];
  compact?: boolean;
}) {
  const url = getPublishedUrl(view);
  return url ? (
    <ViewLinkActions
      url={url}
      name={view.name}
      compact={compact}
      onCopy={onCopy}
    />
  ) : (
    <span className={styles.unpublished}>Chưa có link xuất bản</span>
  );
}

export default function ViewsTable(props: ViewsTableProps) {
  if (!props.isLoading && props.errorMessage) {
    return (
      <EmptyState
        title="Không thể tải danh sách trang dữ liệu"
        description={props.errorMessage}
        icon={<SheetIcon />}
        action={<SharedButton onClick={props.onRetry}>Thử lại</SharedButton>}
      />
    );
  }
  if (!props.isLoading && props.views.length === 0) {
    return (
      <EmptyState
        title={
          props.hasFilters
            ? "Không tìm thấy trang phù hợp"
            : "Chưa có trang dữ liệu nào"
        }
        description={
          props.hasFilters
            ? "Thử từ khóa khác hoặc xóa bộ lọc để xem lại danh sách."
            : "Tạo trang để xuất bản và chia sẻ dữ liệu từ Google Sheets."
        }
        icon={<SheetIcon />}
        action={
          props.hasFilters ? (
            <SharedButton variant="outlined" onClick={props.onClearFilters}>
              Xóa bộ lọc
            </SharedButton>
          ) : (
            <AppLink className="ui-button" href="/owner/views/new">
              Tạo trang mới
            </AppLink>
          )
        }
      />
    );
  }
  if (props.isLoading) {
    return (
      <div
        className={styles.loading}
        role="status"
        aria-label="Đang tải trang dữ liệu"
        aria-busy="true"
      >
        {Array.from({ length: 5 }, (_, row) => (
          <div key={row} className={styles.loadingRow} aria-hidden="true">
            <span className="ui-skeleton h-5 w-2/3" />
            <span className="ui-skeleton h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      <div className={styles.desktop}>
        <table className={`ui-table ${styles.table}`}>
          <caption className="sr-only">
            Trang dữ liệu, trạng thái và link truy cập. Bấm tên để xem chi tiết.
          </caption>
          <colgroup>
            <col className={styles.nameColumn} />
            <col className={styles.statusColumn} />
            <col className={styles.dateColumn} />
            <col className={styles.accessColumn} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Tên trang / nguồn dữ liệu</th>
              <th scope="col">Trạng thái / truy cập</th>
              <th scope="col">Cập nhật dữ liệu</th>
              <th scope="col">Link truy cập</th>
            </tr>
          </thead>
          <tbody>
            {props.views.map((view) => (
              <tr key={view.id}>
                <td>
                  <ViewIdentity view={view} onDetail={props.onDetail} />
                </td>
                <td>
                  <ViewBadges view={view} />
                </td>
                <td>{formatDateTime(view.currentSnapshot?.fetchedAt)}</td>
                <td>
                  <ViewAccess view={view} onCopy={props.onCopy} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className={styles.mobile} aria-label="Trang dữ liệu">
        {props.views.map((view) => (
          <li className={styles.card} key={view.id}>
            <ViewIdentity view={view} onDetail={props.onDetail} />
            <ViewBadges view={view} />
            <p className={styles.updated}>
              Cập nhật dữ liệu:{" "}
              {formatDateTime(view.currentSnapshot?.fetchedAt)}
            </p>
            <div className={styles.cardAccess}>
              <ViewAccess view={view} onCopy={props.onCopy} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
