import EmptyState from "@/src/components/common/empty-state";
import { ExternalIcon, TableIcon } from "@/src/components/common/icons";
import StatusBadge from "@/src/components/common/status-badge";
import { SharedButton } from "@/src/components/share";
import {
  AccessBadge,
  formatDateTime,
} from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import type { ViewerSharedView } from "@/src/types/viewer";
import styles from "./shared-views.module.css";

type SharedViewItemProps = {
  view: ViewerSharedView;
  onOpen: (view: ViewerSharedView) => void;
};

type SharedViewsListProps = {
  views: ViewerSharedView[];
  isLoading: boolean;
  errorMessage: string | null;
  hasSearch: boolean;
  onRetry: () => void;
  onOpen: SharedViewItemProps["onOpen"];
};

function ViewOwner({ view }: Pick<SharedViewItemProps, "view">) {
  return (
    <div className={styles.owner}>
      <p>{view.owner.fullName || view.owner.email}</p>
      {view.owner.fullName ? <span>{view.owner.email}</span> : null}
    </div>
  );
}

function OpenViewButton({ view, onOpen }: SharedViewItemProps) {
  return (
    <SharedButton
      variant="outlined"
      className={styles.openButton}
      aria-label={`Xem View: ${view.name}`}
      onClick={() => onOpen(view)}
    >
      <ExternalIcon />
      Xem View
    </SharedButton>
  );
}

function LoadingState() {
  return (
    <div
      className={styles.loading}
      role="status"
      aria-label="Đang tải danh sách view được chia sẻ"
      aria-busy="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div className={styles.loadingRow} key={index} aria-hidden="true">
          <span className="ui-skeleton h-10 w-10" />
          <div className="min-w-0 flex-1 space-y-3">
            <span className="ui-skeleton h-5 w-2/3" />
            <span className="ui-skeleton h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SharedViewCard({ view, onOpen }: SharedViewItemProps) {
  return (
    <li className={styles.card}>
      <div className={styles.cardHeading}>
        <span className={styles.viewIcon}>
          <TableIcon />
        </span>
        <h3>{view.name}</h3>
      </div>
      <dl className={styles.cardDetails}>
        <div className={styles.cardOwner}>
          <dt>Người chia sẻ</dt>
          <dd>
            <ViewOwner view={view} />
          </dd>
        </div>
        <div>
          <dt>Quyền</dt>
          <dd>
            <StatusBadge tone="success" showDot={false}>
              View
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>Truy cập</dt>
          <dd>
            <AccessBadge accessMode={view.accessMode} />
          </dd>
        </div>
        <div>
          <dt>Số dòng</dt>
          <dd className={styles.numeric}>{view.snapshot?.rowCount ?? "--"}</dd>
        </div>
        <div>
          <dt>Cập nhật lần cuối</dt>
          <dd>{formatDateTime(view.snapshot?.fetchedAt ?? view.sharedAt)}</dd>
        </div>
      </dl>
      <div className={styles.cardAction}>
        <OpenViewButton view={view} onOpen={onOpen} />
      </div>
    </li>
  );
}

export default function SharedViewsList({
  views,
  isLoading,
  errorMessage,
  hasSearch,
  onRetry,
  onOpen,
}: SharedViewsListProps) {
  if (isLoading) return <LoadingState />;
  if (errorMessage)
    return (
      <div role="alert">
        <EmptyState
          title="Không thể tải danh sách view"
          description={errorMessage}
          icon={<TableIcon />}
          action={<SharedButton onClick={onRetry}>Thử lại</SharedButton>}
        />
      </div>
    );
  if (views.length === 0)
    return (
      <EmptyState
        title={
          hasSearch
            ? "Không tìm thấy view phù hợp"
            : "Bạn chưa được chia sẻ view nào."
        }
        description="Các view được cấp quyền qua owner sẽ xuất hiện tại đây."
        icon={<TableIcon />}
      />
    );

  return (
    <>
      <div className={styles.desktop}>
        <div
          className="ui-table-region"
          role="region"
          tabIndex={0}
          aria-label="Bảng view được chia sẻ, có thể cuộn ngang"
        >
          <table className={`ui-table ${styles.table}`}>
            <caption className="sr-only">
              Các view được chia sẻ, quyền truy cập và thông tin cập nhật
            </caption>
            <colgroup>
              {[240, 208, 96, 112, 80, 168, 168].map((width, index) => (
                <col style={{ width }} key={index} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {[
                  "Tên view",
                  "Người chia sẻ",
                  "Quyền",
                  "Truy cập",
                  "Số dòng",
                  "Cập nhật lần cuối",
                  "Hành động",
                ].map((heading) => (
                  <th scope="col" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {views.map((view) => (
                <tr key={view.id}>
                  <td>
                    <p className={styles.viewName}>{view.name}</p>
                  </td>
                  <td>
                    <ViewOwner view={view} />
                  </td>
                  <td>
                    <StatusBadge tone="success" showDot={false}>
                      View
                    </StatusBadge>
                  </td>
                  <td>
                    <AccessBadge accessMode={view.accessMode} />
                  </td>
                  <td className={styles.numeric}>
                    {view.snapshot?.rowCount ?? "--"}
                  </td>
                  <td>
                    {formatDateTime(view.snapshot?.fetchedAt ?? view.sharedAt)}
                  </td>
                  <td>
                    <OpenViewButton view={view} onOpen={onOpen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.scrollHint}>
          Cuộn ngang để xem đầy đủ thông tin và nút mở view.
        </p>
      </div>
      <ul className={styles.mobile} aria-label="Các view được chia sẻ">
        {views.map((view) => (
          <SharedViewCard view={view} onOpen={onOpen} key={view.id} />
        ))}
      </ul>
    </>
  );
}
