"use client";

import PageHeader from "@/src/components/common/page-header";
import Toast from "@/src/components/common/toast";
import { PlusIcon } from "@/src/components/common/icons";
import { SharedButton } from "@/src/components/share";
import DataSourcesTable from "@/src/components/owner/data-sources/data-sources-table";
import DataSourcesToolbar from "@/src/components/owner/data-sources/data-sources-toolbar";
import DeleteDataSourceModal from "@/src/components/owner/data-sources/delete-data-source-modal";
import Pagination from "@/src/components/owner/data-sources/pagination";
import UpsertDataSourceModal from "@/src/components/owner/data-sources/upsert-data-source-modal";
import useDataSourcesPage from "@/src/features/owner/data-sources/hooks/use-data-sources-page";

export default function DataSourcesPage() {
  const workspace = useDataSourcesPage();

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
      <Toast
        message={workspace.toastMessage}
        onDismiss={workspace.dismissToast}
      />
      <PageHeader
        title="Nguồn dữ liệu"
        description="Kết nối và quản lý các bảng tính Google Sheets dùng để tạo view."
        actions={
          <SharedButton onClick={workspace.openCreateModal}>
            <PlusIcon />
            Thêm nguồn mới
          </SharedButton>
        }
      />
      <section className="ui-panel" aria-label="Danh sách nguồn dữ liệu">
        <DataSourcesToolbar
          search={workspace.search}
          statusFilter={workspace.statusFilter}
          onSearchChange={workspace.handleSearchChange}
          onStatusFilterChange={workspace.handleStatusFilterChange}
        />
        <DataSourcesTable
          dataSources={workspace.dataSources}
          deletingId={workspace.deletingId}
          errorMessage={workspace.tableErrorMessage}
          isLoading={workspace.isLoading}
          onDelete={workspace.openDeleteModal}
          onEdit={workspace.openEditModal}
          onRetry={workspace.retry}
          updatingId={workspace.updatingId}
        />
        {!workspace.tableErrorMessage ? (
          <Pagination
            meta={workspace.paginationMeta}
            onPageChange={workspace.changePage}
          />
        ) : null}
      </section>
      <UpsertDataSourceModal
        dataSource={
          workspace.modalState?.mode === "edit"
            ? workspace.modalState.dataSource
            : null
        }
        isSubmitting={workspace.upsertPending}
        key={
          workspace.modalState?.mode === "edit"
            ? `edit-${workspace.modalState.dataSource.id}`
            : "create-data-source"
        }
        mode={workspace.modalState?.mode ?? "create"}
        onClose={workspace.closeUpsertModal}
        onSubmit={workspace.handleUpsertDataSource}
        open={Boolean(workspace.modalState)}
      />
      <DeleteDataSourceModal
        dataSource={workspace.deleteTarget}
        isSubmitting={Boolean(workspace.deletingId)}
        onClose={workspace.closeDeleteModal}
        onConfirm={workspace.handleDeleteDataSource}
        open={Boolean(workspace.deleteTarget)}
      />
    </section>
  );
}
