"use client";

import AddDataSourceModal from "@/src/components/owner/data-sources/add-data-source-modal";
import DataSourcesTable from "@/src/components/owner/data-sources/data-sources-table";
import Pagination from "@/src/components/owner/data-sources/pagination";
import {
  useCreateDataSource,
  useDataSources,
} from "@/src/hooks/owner/use-data-sources";
import type {
  CreateDataSourceBody,
  DataSourceStatusFilter,
} from "@/src/types/data-source";
import { useQueryClient } from "@tanstack/react-query";
import type { ChangeEvent, SVGProps } from "react";
import { useState } from "react";

const DATA_SOURCES_LIMIT = 10;

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

export default function DataSourcesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    DataSourceStatusFilter | ""
  >("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dataSourcesQuery = useDataSources({
    page,
    limit: DATA_SOURCES_LIMIT,
    search,
    status: statusFilter || undefined,
  });
  const createDataSourceMutation = useCreateDataSource();

  const dataSources = dataSourcesQuery.data?.items ?? [];
  const paginationMeta =
    dataSourcesQuery.data?.meta ?? {
      page,
      limit: DATA_SOURCES_LIMIT,
      total: 0,
      totalPages: 1,
    };
  const tableErrorMessage = dataSourcesQuery.isError
    ? getErrorMessage(
        dataSourcesQuery.error,
        "Không thể tải danh sách nguồn dữ liệu.",
      )
    : null;

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleStatusFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(event.target.value as DataSourceStatusFilter | "");
    setPage(1);
  }

  async function handleCreateDataSource(values: CreateDataSourceBody) {
    await createDataSourceMutation.mutateAsync(values);
    setPage(1);
    setToastMessage("Thêm nguồn thành công");
    await queryClient.invalidateQueries({ queryKey: ["data-sources"] });
  }

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col gap-6">
      {toastMessage ? (
        <div className="fixed right-6 top-20 z-40 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
          <span>{toastMessage}</span>
          <button
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-emerald-700 transition-colors hover:bg-emerald-100"
            onClick={() => setToastMessage(null)}
            type="button"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nguồn dữ liệu</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Quản lý các Google Sheet đã kết nối vào hệ thống
          </p>
        </div>

        <button
          className="inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-blue-700 bg-blue-700 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(30,58,138,0.18)] transition-colors hover:border-blue-800 hover:bg-blue-800"
          onClick={() => setAddModalOpen(true)}
          type="button"
        >
          <PlusIcon className="h-5 w-5" />
          Thêm nguồn mới
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="relative min-w-[280px] flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            onChange={handleSearchChange}
            placeholder="Tìm tên nguồn dữ liệu..."
            type="search"
            value={search}
          />
        </div>

        <select
          className="h-11 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
          onChange={handleStatusFilterChange}
          value={statusFilter}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Success</option>
          <option value="error">Error</option>
          <option value="disconnected">Disconnected</option>
        </select>
      </div>

      <DataSourcesTable
        dataSources={dataSources}
        errorMessage={tableErrorMessage}
        isLoading={dataSourcesQuery.isPending}
        onRetry={() => dataSourcesQuery.refetch()}
      />

      {!tableErrorMessage ? (
        <Pagination meta={paginationMeta} onPageChange={setPage} />
      ) : null}

      <AddDataSourceModal
        isSubmitting={createDataSourceMutation.isPending}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleCreateDataSource}
        open={addModalOpen}
      />
    </section>
  );
}
