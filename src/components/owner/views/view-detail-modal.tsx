import { useState } from "react";
import Modal from "@/src/components/common/modal";
import QueryFeedback from "@/src/components/common/query-feedback";
import Toast from "@/src/components/common/toast";
import { ChevronRightIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import { useView } from "@/src/hooks/owner/use-views";
import {
  formatDateTime,
  getErrorMessage,
  getPublishedUrl,
  getSelectionLabel,
  getThemePreset,
  isPublishedView,
} from "@/src/features/owner/views/view-utils";
import { ViewAccessBadge, ViewStatusBadge } from "./view-badges";
import ViewLinkActions from "./view-link-actions";
import ViewAccessPanel from "./view-access-panel";
import type { OwnerView } from "@/src/types/view";
import type { ViewToast } from "@/src/features/owner/views/types";
import styles from "./views.module.css";

type ViewDetailModalProps = {
  viewId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onPublish: (view: OwnerView) => void;
  onDelete: (view: OwnerView) => void;
  onCopy: (url: string) => void;
  onToast: (toast: ViewToast) => void;
  toast: ViewToast | null;
  onDismissToast: () => void;
  publishPending: boolean;
  deletingId: string | null | undefined;
};

export default function ViewDetailModal(props: ViewDetailModalProps) {
  const viewQuery = useView(props.viewId);
  const [accessLoaded, setAccessLoaded] = useState(false);
  if (!props.viewId) return null;
  const view = viewQuery.data;
  const url = view ? getPublishedUrl(view) : null;
  const busy = props.publishPending || props.deletingId === props.viewId;
  const canEdit = view && (view.status === "draft" || isPublishedView(view));
  const detailItems = view
    ? [
        ["Nguồn dữ liệu", view.dataSource?.title ?? "—"],
        ["Sheet", view.sourceSheet?.sheetName ?? "—"],
        [
          "Phạm vi dữ liệu",
          getSelectionLabel(view.selectionType, view.rangeA1Notation),
        ],
        ["Số dòng đã xuất bản", view.currentSnapshot?.rowCount ?? "—"],
        ["Cập nhật dữ liệu", formatDateTime(view.currentSnapshot?.fetchedAt)],
        ["Đường dẫn định danh", view.slug],
        [
          "Dùng hàng đầu làm tiêu đề",
          view.useFirstRowAsHeader ? "Có" : "Không",
        ],
        ["Cho người xem đổi giao diện", view.allowThemeSwitch ? "Có" : "Không"],
        ["Giao diện bảng", getThemePreset(view.themeOverrideJson)],
      ]
    : [];

  return (
    <Modal
      open
      title="Chi tiết trang dữ liệu"
      description={view?.name}
      size="lg"
      busy={busy}
      onClose={props.onClose}
    >
      <div className={props.toast ? "ui-sharing-feedback" : undefined}>
        <Toast
          message={props.toast?.message ?? null}
          tone={props.toast?.type}
          placement="inline"
          onDismiss={props.onDismissToast}
        />
      </div>
      <div className={`ui-modal-body ${styles.detailBody}`}>
        <QueryFeedback
          isLoading={viewQuery.isPending}
          errorMessage={
            viewQuery.isError
              ? getErrorMessage(
                  viewQuery.error,
                  "Không thể tải chi tiết trang dữ liệu.",
                )
              : null
          }
          onRetry={() => viewQuery.refetch()}
        >
          {view ? (
            <>
              <div className={styles.badges}>
                <ViewStatusBadge status={view.status} />
                <ViewAccessBadge accessMode={view.accessMode} />
              </div>
              <section
                className={styles.linkPanel}
                aria-label="Link truy cập trang dữ liệu"
              >
                <h3>Link truy cập</h3>
                {url ? (
                  <>
                    <a
                      className={styles.url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                      <span className="sr-only"> (mở trong tab mới)</span>
                    </a>
                    <ViewLinkActions
                      url={url}
                      name={view.name}
                      onCopy={props.onCopy}
                    />
                    <p className={styles.help}>
                      {view.accessMode === "private"
                        ? "Link này dành cho người đã được cấp quyền. Bạn có thể quản lý người xem hoặc tạo link truy cập riêng bên dưới."
                        : "Ai có link đều có thể xem trang này."}
                    </p>
                  </>
                ) : (
                  <p className={styles.help}>
                    Trang chưa được xuất bản. Link sẽ xuất hiện sau khi xuất bản
                    thành công.
                  </p>
                )}
              </section>
              {isPublishedView(view) && view.accessMode === "private" ? (
                <details
                  className={styles.accessSection}
                  onToggle={(event) => {
                    if (event.currentTarget.open) setAccessLoaded(true);
                  }}
                >
                  <summary className={styles.accessSummary}>
                    Quyền truy cập
                    <ChevronRightIcon />
                  </summary>
                  {accessLoaded ? (
                    <ViewAccessPanel view={view} onToast={props.onToast} />
                  ) : null}
                </details>
              ) : null}
              <section aria-label="Cấu hình trang dữ liệu">
                <h3 className={styles.detailHeading}>Thông tin dữ liệu</h3>
                <dl className="ui-view-details">
                  {detailItems.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </>
          ) : null}
        </QueryFeedback>
      </div>
      {view && !viewQuery.isError ? (
        <div className={`ui-modal-footer ${styles.detailFooter}`}>
          <SharedButton
            className={styles.deleteButton}
            variant="outlined"
            disabled={busy}
            onClick={() => props.onDelete(view)}
          >
            {props.deletingId === view.id ? "Đang xóa..." : "Xóa trang"}
          </SharedButton>
          <div className={styles.footerActions}>
            {view.status === "draft" ? (
              <SharedButton
                variant="outlined"
                disabled={busy}
                onClick={() => props.onPublish(view)}
              >
                {props.publishPending ? "Đang xuất bản..." : "Xuất bản"}
              </SharedButton>
            ) : null}
            {canEdit ? (
              <SharedButton
                disabled={busy}
                onClick={() => props.onEdit(view.id)}
              >
                Chỉnh sửa
              </SharedButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
