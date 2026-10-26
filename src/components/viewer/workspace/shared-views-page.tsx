"use client";

import PageHeader from "@/src/components/common/page-header";
import Pagination from "@/src/components/common/pagination";
import { SearchIcon } from "@/src/components/common/icons";
import SharedViewsList from "@/src/components/viewer/workspace/shared-views-list";
import {
  getErrorMessage,
  getViewUrl,
} from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import { useViewerViews } from "@/src/hooks/viewer/use-viewer-workspace";
import { pushAppPath } from "@/src/lib/app-path";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import styles from "./shared-views.module.css";

const SHARED_VIEWS_LIMIT = 10;

export default function SharedViewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const viewsQuery = useViewerViews({
    page,
    limit: SHARED_VIEWS_LIMIT,
    search,
    sort: "latest",
  });

  const views = viewsQuery.data?.items ?? [];
  const paginationMeta = viewsQuery.data?.meta ?? {
    page,
    limit: SHARED_VIEWS_LIMIT,
    total: 0,
    totalPages: 1,
  };
  const tableErrorMessage = viewsQuery.isError
    ? getErrorMessage(
        viewsQuery.error,
        "Không thể tải danh sách view được chia sẻ.",
      )
    : null;
  const hasSearch = Boolean(search.trim());

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(1);
  }

  return (
    <section className={styles.page}>
      <PageHeader
        title="Được chia sẻ với tôi"
        description="Tìm và mở các view bạn được cấp quyền truy cập."
      />
      <section className={styles.panel} aria-labelledby="shared-views-heading">
        <h2 className="sr-only" id="shared-views-heading">
          Danh sách view được chia sẻ
        </h2>
        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <label className="ui-field-label" htmlFor="shared-view-search">
              Tìm kiếm view
            </label>
            <div className={styles.searchInput}>
              <SearchIcon />
              <input
                id="shared-view-search"
                autoComplete="off"
                onChange={handleSearchChange}
                placeholder="Tìm tên view..."
                type="search"
                value={search}
              />
            </div>
          </div>
          <p className={styles.sortHint}>
            Sắp xếp: <span>Mới nhất</span>
          </p>
        </div>
        <SharedViewsList
          views={views}
          isLoading={viewsQuery.isPending}
          errorMessage={tableErrorMessage}
          hasSearch={hasSearch}
          onRetry={() => void viewsQuery.refetch()}
          onOpen={(view) => pushAppPath(router, getViewUrl(view))}
        />
        {!tableErrorMessage ? (
          <Pagination
            meta={paginationMeta}
            onPageChange={setPage}
            itemLabel="view"
            ariaLabel="Phân trang view được chia sẻ"
          />
        ) : null}
      </section>
    </section>
  );
}
