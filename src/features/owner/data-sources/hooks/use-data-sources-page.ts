"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

  async function refreshDataSources() {
    await queryClient.invalidateQueries({ queryKey: ["data-sources"] });
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
      await refreshDataSources();
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
    handleSearchChange,
    handleStatusFilterChange,
    openCreateModal,
    openEditModal,
    handleUpsertDataSource,
    handleDeleteDataSource,
    changePage: setPage,
    openDeleteModal: setDeleteTarget,
    closeUpsertModal: () => setModalState(null),
    closeDeleteModal: () => setDeleteTarget(null),
    dismissToast: () => setToastMessage(null),
    retry: () => dataSourcesQuery.refetch(),
  };
}
