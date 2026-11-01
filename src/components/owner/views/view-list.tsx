"use client";

import AppLink from "@/src/components/app-link";
import PageHeader from "@/src/components/common/page-header";
import Pagination from "@/src/components/common/pagination";
import Toast from "@/src/components/common/toast";
import ConfirmDialog from "@/src/components/common/confirm-dialog";
import { PlusIcon } from "@/src/components/common/icons";
import ViewsToolbar from "@/src/components/owner/views/views-toolbar";
import ViewsTable from "@/src/components/owner/views/views-table";
import ViewDetailModal from "@/src/components/owner/views/view-detail-modal";
import useViewsPage from "@/src/features/owner/views/hooks/use-views-page";

export default function ViewList() {
  const workspace = useViewsPage();

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
      <Toast
        message={
          workspace.detailViewId
            ? null
            : (workspace.toastMessage?.message ?? null)
        }
        tone={workspace.toastMessage?.type}
        onDismiss={workspace.dismissToast}
      />
      <PageHeader
        title="Trang dữ liệu"
        description="Quản lý, xuất bản và chia sẻ các trang dữ liệu từ Google Sheets."
        actions={
          <AppLink className="ui-button" href="/owner/views/new">
            <PlusIcon />
            Tạo trang mới
          </AppLink>
        }
      />
      <section className="ui-panel" aria-label="Danh sách trang dữ liệu">
        <ViewsToolbar
          search={workspace.search}
          statusFilter={workspace.statusFilter}
          accessModeFilter={workspace.accessModeFilter}
          onSearchChange={workspace.handleSearchChange}
          onStatusChange={workspace.handleStatusChange}
          onAccessModeChange={workspace.handleAccessModeChange}
        />
        <ViewsTable
          views={workspace.views}
          isLoading={workspace.isLoading}
          errorMessage={workspace.tableErrorMessage}
          hasFilters={workspace.hasFilters}
          onRetry={workspace.retry}
          onClearFilters={workspace.clearFilters}
          onDetail={workspace.showDetail}
          onCopy={workspace.handleCopyLink}
        />
        {!workspace.tableErrorMessage ? (
          <Pagination
            meta={workspace.paginationMeta}
            onPageChange={workspace.changePage}
            itemLabel="trang"
            ariaLabel="Phân trang dữ liệu"
          />
        ) : null}
      </section>
      <ViewDetailModal
        key={workspace.detailViewId ?? "closed-detail"}
        viewId={workspace.detailViewId}
        onClose={workspace.closeDetail}
        onEdit={workspace.openEditor}
        onPublish={workspace.handlePublish}
        onDelete={workspace.handleDelete}
        onCopy={workspace.handleCopyLink}
        onToast={workspace.showToast}
        toast={workspace.toastMessage}
        onDismissToast={workspace.dismissToast}
        publishPending={workspace.publishPending}
        deletingId={workspace.deletingId}
      />
      {workspace.confirmationProps ? (
        <ConfirmDialog {...workspace.confirmationProps} />
      ) : null}
    </section>
  );
}
