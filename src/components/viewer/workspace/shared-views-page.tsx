"use client";

import {
  AccessBadge,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalIcon,
  SearchIcon,
  formatDateTime,
  getErrorMessage,
  getViewUrl,
} from "@/src/components/viewer/workspace/viewer-shared-view-ui";
import { useViewerViews } from "@/src/hooks/viewer/use-viewer-workspace";
import { pushAppPath } from "@/src/lib/app-path";
import type { PaginationMeta } from "@/src/types/pagination";
import type { ViewerSharedView } from "@/src/types/viewer";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useState } from "react";

const SHARED_VIEWS_LIMIT = 10;

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => startPage + index);
}

function Pagination({
  meta,
  onPageChange,
}: {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(meta.totalPages, 1);
  const currentPage = Math.min(Math.max(meta.page, 1), totalPages);
  const startItem = meta.total === 0 ? 0 : (currentPage - 1) * meta.limit + 1;
  const endItem = Math.min(currentPage * meta.limit, meta.total);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm font-medium text-slate-500">
        Hiển thị <span className="font-bold text-slate-900">{startItem}</span>
        {"-"}
        <span className="font-bold text-slate-900">{endItem}</span> trong tổng
        số <span className="font-bold text-slate-900">{meta.total}</span> view
      </p>

      <div className="flex items-center gap-1.5">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {visiblePages.map((page) => {
          const active = page === currentPage;
          return (
            <button
              className={`inline-flex h-11 w-11 items-center justify-center rounded-md text-sm font-bold transition-colors ${
                active
                  ? "bg-blue-700 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              key={page}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          );
        })}

        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr
          className="border-b border-slate-100"
          key={`shared-view-loading-${index}`}
        >
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <td
              className="px-5 py-5"
              key={`shared-view-loading-${index}-${cellIndex}`}
            >
              <div className="h-5 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SharedViewRow({
  view,
  onOpen,
}: {
  view: ViewerSharedView;
  onOpen: (view: ViewerSharedView) => void;
}) {
  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50">
      <td className="max-w-[280px] px-5 py-5">
        <p className="line-clamp-2 font-bold text-slate-900">{view.name}</p>
      </td>
      <td className="max-w-[240px] px-5 py-5">
        <p className="line-clamp-1 font-semibold text-slate-700">
          {view.owner.fullName || view.owner.email}
        </p>
        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
          {view.owner.email}
        </p>
      </td>
      <td className="px-5 py-5">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
          View
        </span>
      </td>
      <td className="px-5 py-5">
        <AccessBadge accessMode={view.accessMode} />
      </td>
      <td className="px-5 py-5 font-semibold text-slate-700">
        {view.snapshot?.rowCount ?? "--"}
      </td>
      <td className="px-5 py-5 font-semibold text-slate-500">
        {formatDateTime(view.snapshot?.fetchedAt ?? view.sharedAt)}
      </td>
      <td className="px-5 py-5">
        <button
          className="inline-flex h-10 w-28 items-center justify-center gap-2 rounded-md border border-blue-700 bg-blue-700 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
          onClick={() => onOpen(view)}
          type="button"
        >
          <ExternalIcon className="h-4 w-4" />
          Xem View
        </button>
      </td>
    </tr>
  );
}

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
  const paginationMeta =
    viewsQuery.data?.meta ?? {
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
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Được chia sẻ với tôi
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Danh sách các view bạn được cấp quyền truy cập
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="relative min-w-[280px] flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            onChange={handleSearchChange}
            placeholder="Tìm tên view..."
            type="search"
            value={search}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-[#f5f5fa]">
              <tr className="border-b border-slate-100">
                {[
                  "Tên view",
                  "Người chia sẻ",
                  "Quyền",
                  "Truy cập",
                  "Số dòng",
                  "Cập nhật lần cuối",
                  "Hành động",
                ].map((heading) => (
                  <th
                    className="px-5 py-4 text-sm font-bold text-slate-500"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {viewsQuery.isPending ? (
                <LoadingRows />
              ) : tableErrorMessage ? (
                <tr>
                  <td className="px-6 py-14 text-center" colSpan={7}>
                    <div className="mx-auto max-w-md">
                      <p className="text-base font-bold text-slate-900">
                        Không thể tải danh sách view
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        {tableErrorMessage}
                      </p>
                      <button
                        className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-bold text-white transition-colors hover:border-blue-800 hover:bg-blue-800"
                        onClick={() => viewsQuery.refetch()}
                        type="button"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : views.length === 0 ? (
                <tr>
                  <td className="px-6 py-16 text-center" colSpan={7}>
                    <div className="mx-auto max-w-md">
                      <p className="text-base font-bold text-slate-900">
                        {hasSearch
                          ? "Không tìm thấy view phù hợp"
                          : "Bạn chưa được chia sẻ view nào."}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Các view được cấp quyền qua owner sẽ xuất hiện tại đây.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                views.map((view) => (
                  <SharedViewRow
                    key={view.id}
                    onOpen={(item) => pushAppPath(router, getViewUrl(item))}
                    view={view}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!tableErrorMessage ? (
        <Pagination meta={paginationMeta} onPageChange={setPage} />
      ) : null}
    </section>
  );
}
