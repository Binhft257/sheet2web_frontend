"use client";

import { useRouter } from "next/navigation";
import AppLink from "@/src/components/app-link";
import PageHeader from "@/src/components/common/page-header";
import Pagination from "@/src/components/common/pagination";
import Toast from "@/src/components/common/toast";
import { PlusIcon } from "@/src/components/common/icons";
import ViewsToolbar from "@/src/components/owner/views/views-toolbar";
import ViewsTable from "@/src/components/owner/views/views-table";
import ViewDetailModal from "@/src/components/owner/views/view-detail-modal";
import ViewSharingModal from "@/src/components/owner/views/view-sharing-modal";
import useViewsPage from "@/src/features/owner/views/hooks/use-views-page";
import { pushAppPath } from "@/src/lib/app-path";

export default function ViewList() {
  const router = useRouter();
  const workspace = useViewsPage();

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
      <Toast
        message={
          workspace.sharingView
            ? null
            : (workspace.toastMessage?.message ?? null)
        }
        tone={workspace.toastMessage?.type}
        onDismiss={workspace.dismissToast}
      />
      <PageHeader
        title="Quản lý view"
        description="Quản lý, xuất bản và chia sẻ các trang dữ liệu từ Google Sheets."
        actions={
          <AppLink className="ui-button" href="/owner/views/new">
            <PlusIcon />
            Tạo view mới
          </AppLink>
        }
      />
      <section className="ui-panel" aria-label="Danh sách view">
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
          publishPending={workspace.publishPending}
          deletingId={workspace.deletingId}
          onRetry={workspace.retry}
          onDetail={workspace.showDetail}
          onEdit={(id) =>
            pushAppPath(router, `/owner/views/new?viewId=${id}&step=2`)
          }
          onShare={workspace.showSharing}
          onPublish={workspace.handlePublish}
          onDelete={workspace.handleDelete}
        />
        {!workspace.tableErrorMessage ? (
          <Pagination
            meta={workspace.paginationMeta}
            onPageChange={workspace.changePage}
            itemLabel="view"
            ariaLabel="Phân trang view"
          />
        ) : null}
      </section>
      <ViewDetailModal
        viewId={workspace.detailViewId}
        onClose={workspace.closeDetail}
      />
      <ViewSharingModal
        key={workspace.sharingView?.id ?? "sharing-modal"}
        view={workspace.sharingView}
        onClose={workspace.closeSharing}
        onToast={workspace.showToast}
        toast={workspace.toastMessage}
        onDismissToast={workspace.dismissToast}
      />
    </section>
  );
}
