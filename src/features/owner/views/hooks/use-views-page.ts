"use client";

import {
  useDeleteView,
  usePublishView,
  useViews,
} from "@/src/hooks/owner/use-views";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { OwnerView } from "@/src/types/view";
import {
  getAbsoluteUrl,
  getErrorMessage,
  isPublishedView,
} from "@/src/features/owner/views/view-utils";
import type { ViewToast } from "@/src/features/owner/views/types";
import useViewListNavigation from "./use-view-list-navigation";

const VIEWS_LIMIT = 10;

export default function useViewsPage() {
  const queryClient = useQueryClient();
  const navigation = useViewListNavigation();
  const {
    page,
    search,
    statusFilter,
    accessModeFilter,
    detailViewId,
    restoreScroll,
  } = navigation;
  const [toastMessage, setToastMessage] = useState<ViewToast | null>(null);

  const viewsQuery = useViews({
    page,
    limit: VIEWS_LIMIT,
    search,
    status: statusFilter || undefined,
    accessMode: accessModeFilter || undefined,
  });
  const publishViewMutation = usePublishView();
  const deleteViewMutation = useDeleteView();

  useEffect(() => {
    if (!viewsQuery.isPending) return restoreScroll();
  }, [viewsQuery.isPending, restoreScroll]);

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
    navigation.changeSearch(event.target.value);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    navigation.changeStatus(event.target.value);
  }

  function handleAccessModeChange(event: ChangeEvent<HTMLSelectElement>) {
    navigation.changeAccess(event.target.value);
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
      await queryClient.invalidateQueries({
        queryKey: ["views", "detail", view.id],
      });
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
      navigation.closeDetail();
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

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(getAbsoluteUrl(url));
      showToast({ type: "success", message: "Đã sao chép link truy cập." });
    } catch {
      showToast({
        type: "error",
        message: "Không thể sao chép link. Vui lòng thử lại.",
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
    handleCopyLink,
    clearFilters: navigation.clearFilters,
    showToast,
    changePage: navigation.changePage,
    showDetail: navigation.showDetail,
    closeDetail: navigation.closeDetail,
    openEditor: navigation.openEditor,
    dismissToast: () => setToastMessage(null),
    retry: () => viewsQuery.refetch(),
  };
}
