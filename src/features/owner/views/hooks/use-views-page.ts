"use client";

import {
  useDeleteView,
  usePublishView,
  useViews,
} from "@/src/hooks/owner/use-views";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ChangeEvent } from "react";
import type {
  OwnerView,
  ViewStatusFilter,
  ViewAccessModeFilter,
} from "@/src/types/view";
import {
  getErrorMessage,
  isPublishedView,
} from "@/src/features/owner/views/view-utils";
import type { ViewToast } from "@/src/features/owner/views/types";

const VIEWS_LIMIT = 10;

export default function useViewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ViewStatusFilter | "">("");
  const [accessModeFilter, setAccessModeFilter] = useState<
    ViewAccessModeFilter | ""
  >("");
  const [toastMessage, setToastMessage] = useState<ViewToast | null>(null);
  const [detailViewId, setDetailViewId] = useState<string | null>(null);
  const [sharingView, setSharingView] = useState<OwnerView | null>(null);

  const viewsQuery = useViews({
    page,
    limit: VIEWS_LIMIT,
    search,
    status: statusFilter || undefined,
    accessMode: accessModeFilter || undefined,
  });
  const publishViewMutation = usePublishView();
  const deleteViewMutation = useDeleteView();

  const views = useMemo(() => viewsQuery.data?.items ?? [], [viewsQuery.data]);
  const paginationMeta = viewsQuery.data?.meta ?? {
    page,
    limit: VIEWS_LIMIT,
    total: 0,
    totalPages: 1,
  };
  const tableErrorMessage = viewsQuery.isError
    ? getErrorMessage(viewsQuery.error, "Không thể tải danh sách view.")
    : null;

  const hasFilters = useMemo(
    () => Boolean(search.trim() || statusFilter || accessModeFilter),
    [accessModeFilter, search, statusFilter],
  );

  function showToast(toast: ViewToast) {
    setToastMessage(toast);
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value as ViewStatusFilter | "");
    setPage(1);
  }

  function handleAccessModeChange(event: ChangeEvent<HTMLSelectElement>) {
    setAccessModeFilter(event.target.value as ViewAccessModeFilter | "");
    setPage(1);
  }

  async function handlePublish(view: OwnerView) {
    try {
      const isRefresh = isPublishedView(view);
      const result = await publishViewMutation.mutateAsync(view.id);
      showToast({
        type: "success",
        message: isRefresh
          ? `Xuất bản lại thành công: ${result.url}`
          : `Xuất bản thành công: ${result.url}`,
      });
      await queryClient.invalidateQueries({ queryKey: ["views", "my"] });
    } catch (error) {
      showToast({
        type: "error",
        message: getErrorMessage(error, "Không thể xuất bản view."),
      });
    }
  }

  async function handleDelete(view: OwnerView) {
    if (!window.confirm(`Bạn có chắc muốn xóa view "${view.name}"?`)) {
      return;
    }

    try {
      await deleteViewMutation.mutateAsync(view.id);
      showToast({
        type: "success",
        message: "Đã xóa view thành công.",
      });
      await queryClient.invalidateQueries({ queryKey: ["views", "my"] });
    } catch (error) {
      showToast({
        type: "error",
        message: getErrorMessage(error, "Không thể xóa view."),
      });
    }
  }

  return {
    page,
    search,
    statusFilter,
    accessModeFilter,
    toastMessage,
    detailViewId,
    sharingView,
    views,
    paginationMeta,
    tableErrorMessage,
    hasFilters,
    isLoading: viewsQuery.isPending,
    publishPending: publishViewMutation.isPending,
    deletingId: deleteViewMutation.isPending
      ? deleteViewMutation.variables
      : null,
    handleSearchChange,
    handleStatusChange,
    handleAccessModeChange,
    handlePublish,
    handleDelete,
    showToast,
    changePage: setPage,
    showDetail: setDetailViewId,
    closeDetail: () => setDetailViewId(null),
    showSharing: setSharingView,
    closeSharing: () => setSharingView(null),
    dismissToast: () => setToastMessage(null),
    retry: () => viewsQuery.refetch(),
  };
}
