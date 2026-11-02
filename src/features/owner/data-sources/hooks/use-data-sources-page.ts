"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import useConfirmDialog from "@/src/hooks/use-confirm-dialog";
import { getDataSourceUrl } from "../data-source-utils";
import {
  useCreateDataSource,
  useDataSources,
  useDeleteDataSource,
  useUpdateDataSource,
} from "@/src/hooks/owner/use-data-sources";
import type {
  CreateDataSourceBody,
  DataSource,
  DataSourceStatusFilter,
  UpdateDataSourceBody,
} from "@/src/types/data-source";

const DATA_SOURCES_LIMIT = 10;
type ModalState =
  | { mode: "create" }
  | { mode: "edit"; dataSource: DataSource }
  | null;

export default function useDataSourcesPage() {
  const queryClient = useQueryClient();
  const confirmation = useConfirmDialog();
  const syncLock = useRef(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DataSourceStatusFilter | "">(
    "",
  );
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataSource | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dataSourcesQuery = useDataSources({
    page,
    limit: DATA_SOURCES_LIMIT,
    search,
    status: statusFilter || undefined,
  });
  const createDataSourceMutation = useCreateDataSource();
  const updateDataSourceMutation = useUpdateDataSource();
  const syncDataSourceMutation = useUpdateDataSource();
  const deleteDataSourceMutation = useDeleteDataSource();
  const dataSources = dataSourcesQuery.data?.items ?? [];
  const paginationMeta = dataSourcesQuery.data?.meta ?? {
    page,
    limit: DATA_SOURCES_LIMIT,
    total: 0,
    totalPages: 1,
  };
  const tableErrorMessage = dataSourcesQuery.isError
    ? dataSourcesQuery.error instanceof Error &&
      dataSourcesQuery.error.message.trim()
      ? dataSourcesQuery.error.message
      : "Không thể tải danh sách nguồn dữ liệu."
    : null;
  const upsertPending =
    createDataSourceMutation.isPending || updateDataSourceMutation.isPending;
  const updatingId =
    updateDataSourceMutation.isPending && modalState?.mode === "edit"
      ? modalState.dataSource.id
      : null;
  const deletingId =
    deleteDataSourceMutation.isPending && deleteTarget ? deleteTarget.id : null;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: DataSourceStatusFilter | "") {
    setStatusFilter(value);
    setPage(1);
  }

  function openCreateModal() {
    setModalState({ mode: "create" });
  }

  function openEditModal(dataSource: DataSource) {
    setModalState({ mode: "edit", dataSource });
  }

  async function refreshDataSources(dataSourceId?: string) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["data-sources"] }),
      ...(dataSourceId
        ? [
            queryClient.invalidateQueries({
              queryKey: ["data-source-sheets", dataSourceId],
            }),
            // Tab renames/removals also affect existing view details and lists.
            queryClient.invalidateQueries({ queryKey: ["views"] }),
          ]
        : []),
    ]);
  }

  function requestSyncDataSource(dataSource: DataSource) {
    if (syncLock.current || upsertPending || deletingId) return;
    confirmation.requestConfirmation({
      title: "Đồng bộ danh sách sheet",
      message: `Lấy lại danh sách tab hiện tại từ Google Sheets cho nguồn “${dataSource.title}”. Nếu bạn đã xóa tab trên Google Sheets, trang dữ liệu gắn với tab đó cũng sẽ bị xóa khi đồng bộ.`,
      confirmLabel: "Đồng bộ sheet",
      pendingLabel: "Đang đồng bộ...",
      errorMessage:
        "Không thể đồng bộ danh sách sheet. Kiểm tra quyền truy cập Google Sheets và thử lại.",
      onConfirm: async () => {
        if (syncLock.current) return;
        const sourceUrl = getDataSourceUrl(dataSource);
        if (!sourceUrl) {
          throw new Error(
            "Nguồn chưa có link Google Sheets. Chọn Sửa để bổ sung link trước khi đồng bộ.",
          );
        }
        syncLock.current = true;
        setSyncingId(dataSource.id);
        try {
          // Re-submit the stored URL to refresh metadata without renaming the source.
          await syncDataSourceMutation.mutateAsync({
            id: dataSource.id,
            body: { sourceUrl },
          });
          await refreshDataSources(dataSource.id);
          setToastMessage(
            `Đã đồng bộ danh sách sheet của “${dataSource.title}”.`,
          );
        } finally {
          syncLock.current = false;
          setSyncingId(null);
        }
      },
    });
  }

  async function handleUpsertDataSource(
    values: CreateDataSourceBody | UpdateDataSourceBody,
  ) {
    if (modalState?.mode === "create") {
      await createDataSourceMutation.mutateAsync(
        values as CreateDataSourceBody,
      );
      setPage(1);
      setToastMessage("Thêm nguồn thành công");
      setModalState(null);
      await refreshDataSources();
      return;
    }
    if (modalState?.mode === "edit") {
      await updateDataSourceMutation.mutateAsync({
        id: modalState.dataSource.id,
        body: values as UpdateDataSourceBody,
      });
      setModalState(null);
      setToastMessage("Cập nhật nguồn thành công");
      await refreshDataSources(modalState.dataSource.id);
    }
  }

  async function handleDeleteDataSource() {
    if (!deleteTarget) return;
    await deleteDataSourceMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
    setToastMessage("Xóa nguồn thành công");
    await refreshDataSources();
  }

  return {
    confirmationProps: confirmation.dialogProps,
    search,
    statusFilter,
    modalState,
    deleteTarget,
    toastMessage,
    dataSources,
    paginationMeta,
    tableErrorMessage,
    isLoading: dataSourcesQuery.isPending,
    upsertPending,
    updatingId,
    deletingId,
    syncingId,
    handleSearchChange,
    handleStatusFilterChange,
    openCreateModal,
    openEditModal,
    handleUpsertDataSource,
    handleDeleteDataSource,
    requestSyncDataSource,
    changePage: setPage,
    openDeleteModal: setDeleteTarget,
    closeUpsertModal: () => setModalState(null),
    closeDeleteModal: () => setDeleteTarget(null),
    dismissToast: () => setToastMessage(null),
    retry: () => dataSourcesQuery.refetch(),
  };
}
