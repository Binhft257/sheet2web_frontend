"use client";

import EmptyState from "@/src/components/common/empty-state";
import { TableIcon } from "@/src/components/common/icons";
import PageHeader from "@/src/components/common/page-header";
import QueryFeedback from "@/src/components/common/query-feedback";
import { SharedButton } from "@/src/components/share";
import RecentSharedViews from "@/src/components/viewer/workspace/recent-shared-views";
import {
  getErrorMessage,
  getViewUrl,
} from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import { useViewerDashboard } from "@/src/hooks/viewer/use-viewer-workspace";
import { pushAppPath } from "@/src/lib/app-path";
import { useRouter } from "next/navigation";
import styles from "./viewer-dashboard.module.css";

function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Đang tải tổng quan người xem"
      aria-busy="true"
    >
      <div className={styles.loadingSummary} aria-hidden="true">
        <span className="ui-skeleton h-12 w-12" />
        <div className="space-y-3">
          <span className="ui-skeleton h-4 w-40" />
          <span className="ui-skeleton h-8 w-16" />
        </div>
      </div>
      <div className={styles.loadingList} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div className={styles.loadingRow} key={index}>
            <span className="ui-skeleton h-10 w-10" />
            <div className="min-w-0 flex-1 space-y-3">
              <span className="ui-skeleton h-5 w-2/3" />
              <span className="ui-skeleton h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ViewerDashboard() {
  const router = useRouter();
  const dashboardQuery = useViewerDashboard();
  const dashboard = dashboardQuery.data;
  const recentViews = dashboard?.recentSharedViews.slice(0, 5) ?? [];
  const isEmpty = dashboard?.totalSharedViews === 0 || recentViews.length === 0;
  const errorMessage = dashboardQuery.isError
    ? getErrorMessage(
        dashboardQuery.error,
        "Không thể tải tổng quan người xem.",
      )
    : !dashboardQuery.isPending && !dashboard
      ? "Không thể tải tổng quan người xem."
      : null;

  return (
    <section className={styles.dashboard}>
      <PageHeader
        title="Tổng quan người xem"
        description="Theo dõi và mở các view được chia sẻ với bạn."
        actions={
          <SharedButton onClick={() => pushAppPath(router, "/viewer/shared")}>
            Xem tất cả
          </SharedButton>
        }
      />
      {dashboardQuery.isPending ? (
        <LoadingState />
      ) : (
        <QueryFeedback
          isLoading={false}
          errorMessage={errorMessage}
          onRetry={() => void dashboardQuery.refetch()}
        >
          {dashboard ? (
            <section
              className={styles.library}
              aria-labelledby="recent-views-title"
            >
              <div className={styles.summary}>
                <span className={styles.summaryIcon}>
                  <TableIcon />
                </span>
                <dl>
                  <dt>View đã chia sẻ</dt>
                  <dd>{dashboard.totalSharedViews}</dd>
                </dl>
                <p>Các view bạn được cấp quyền truy cập.</p>
              </div>
              <div className={styles.listHeading}>
                <h2 id="recent-views-title">Mới được chia sẻ</h2>
                <p>Tối đa 5 view gần nhất bạn được cấp quyền truy cập.</p>
              </div>
              {isEmpty ? (
                <EmptyState
                  icon={<TableIcon className="h-6 w-6" />}
                  title="Bạn chưa được chia sẻ view nào."
                  description="Khi owner cấp quyền truy cập, các view mới sẽ xuất hiện tại đây."
                />
              ) : (
                <RecentSharedViews
                  views={recentViews}
                  onOpen={(view) => pushAppPath(router, getViewUrl(view))}
                />
              )}
            </section>
          ) : null}
        </QueryFeedback>
      )}
    </section>
  );
}
